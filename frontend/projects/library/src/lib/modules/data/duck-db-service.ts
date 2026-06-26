import { inject, Injectable, Renderer2, signal } from '@angular/core';
import type { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { IndexRecord } from 'gn-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { SearchService } from '../search/search-service';
import { Datasource } from './datasource.model';

export interface DatasourceLoadingProgress {
  status:
    | 'idle'
    | 'initializing'
    | 'connecting'
    | 'size'
    | 'downloading'
    | 'completed'
    | 'database'
    | 'format'
    | 'loading'
    | 'canceled'
    | 'error';
  progress: number; // 0-100%
  downloadedBytes: number;
  totalBytes: number;
  contentType: string | null;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DuckDbService {
  private db?: AsyncDuckDB;
  private conn?: AsyncDuckDBConnection;
  private initialized = false;
  private perspectiveInitialized = false;
  private abortController: AbortController | null = null;
  private loadingMode: 'duckdb' | 'browser' = 'duckdb';

  private searchService = inject(SearchService);
  private appConfig = inject(APPLICATION_CONFIGURATION);

  public progress = signal<DatasourceLoadingProgress>({
    status: 'idle',
    progress: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    contentType: null,
  });

  private async createWorkerFromUrl(url: string): Promise<Worker> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch worker script: ${res.status}`);
    const script = await res.text();
    const blob = new Blob([script], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);
    URL.revokeObjectURL(blobUrl);
    return worker;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      const duckdb = await import('@duckdb/duckdb-wasm');
      const logger = new duckdb.ConsoleLogger();
      const bundles = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
      const worker = await this.createWorkerFromUrl(bundles.mainWorker as string);
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundles.mainModule);
      this.conn = await this.db.connect();

      await this.conn.query(`
        INSTALL json; LOAD json;
        INSTALL spatial; LOAD spatial;
        INSTALL excel; LOAD excel;
      `);
      // INSTALL arrow FROM community; LOAD arrow;

      this.initialized = true;
    } catch (e: unknown) {
      const errorMessage = `DuckDB initialization failed: ${(e as Error)?.message || e}`;
      console.error(errorMessage, e);
      throw new Error(errorMessage);
    }
  }

  async initializePerspective(_renderer: Renderer2): Promise<void> {
    if (this.perspectiveInitialized) return;

    try {
      const perspectiveVersion = '4.4.1';

      // Dynamically load all perspective modules (side-effect imports register custom elements)
      const { perspective, perspective_viewer } = await import('./perspective/perspective-init');

      const wasmUrls = [
        `https://cdn.jsdelivr.net/npm/@perspective-dev/server@${perspectiveVersion}/dist/wasm/perspective-server.wasm`,
        `https://cdn.jsdelivr.net/npm/@perspective-dev/viewer@${perspectiveVersion}/dist/wasm/perspective-viewer.wasm`,
      ];

      await Promise.all([
        perspective.init_server(fetch(wasmUrls[0])),
        perspective_viewer.init_client(fetch(wasmUrls[1])),
      ]);

      this.perspectiveInitialized = true;
    } catch (e: unknown) {
      const errorMessage = `Perspective initialization failed: ${(e as Error)?.message || e}`;
      console.error(errorMessage, e);
      throw new Error(errorMessage);
    }
  }

  async getConnection(): Promise<AsyncDuckDBConnection> {
    await this.init();
    if (!this.conn) {
      throw new Error('DuckDB connection not available');
    }
    return this.conn;
  }

  getSupportedDatasource(record: IndexRecord): Datasource[] {
    return this.searchService.getSupportedDatasource(record);
  }

  async checkDatasourceSize(fileUrl: string, signal: AbortSignal): Promise<boolean> {
    let response: Response;
    let isDirect = true;

    try {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      // First try direct access
      response = await fetch(fileUrl, { method: 'HEAD', signal });
      if (!response.ok) {
        throw new Error(`Direct fetch failed: ${response.status}`);
      }
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError' || signal.aborted) throw e;
      console.warn('Direct HEAD request failed. Switching to browser loading mode.', e);
      isDirect = false;

      // Now try to get metadata via proxy
      try {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        response = await this.tryFetch(fileUrl, { method: 'HEAD', signal });
      } catch (proxyError: unknown) {
        if ((proxyError as Error).name === 'AbortError' || signal.aborted) throw proxyError;
        // Even proxy failed. We can't determine size.
        console.warn('Proxy HEAD also failed', proxyError);
        return false;
      }
    }

    if (!response.ok) {
      return false;
    }

    const contentLength = response.headers.get('Content-Length');
    const contentType = response.headers.get('Content-Type');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    this.progress.update((p) => ({
      ...p,
      status: 'downloading',
      progress: 10,
      totalBytes,
      contentType: this.getFileType(contentType),
      errorMessage:
        totalBytes === 0
          ? 'Warning: Datasource size is unknown (Content-Length missing).'
          : undefined,
    }));
    return isDirect;
  }

  async downloadDatasource(
    fileUrl: string,
    signal: AbortSignal,
  ): Promise<{ buffer: ArrayBuffer; contentType: string }> {
    this.progress.update((p) => ({ ...p, status: 'downloading', errorMessage: undefined }));
    const response = await this.tryFetch(fileUrl, { signal });

    if (!response.ok || !response.body) {
      const errorMsg = `HTTP error: ${response.status}`;
      this.progress.update((p) => ({ ...p, status: 'error', errorMessage: errorMsg }));
      throw new Error(errorMsg);
    }

    const totalBytes = this.progress().totalBytes;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let downloadedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      downloadedBytes += value.length;
      const progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 50 : 0;
      this.progress.update((p) => ({ ...p, downloadedBytes, progress }));
    }

    this.progress.update((p) => ({ ...p, status: 'completed' }));

    const finalBuffer = new Uint8Array(downloadedBytes);
    let offset = 0;

    for (const chunk of chunks) {
      finalBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    return { buffer: finalBuffer.buffer, contentType: response.headers.get('Content-Type') || '' };
  }

  cancelDownload(): void {
    this.abortController?.abort();
    this.progress.update((p) => ({ ...p, status: 'canceled' }));
  }

  getFileType(contentType: string | null): string | null {
    if (!contentType) return null;
    const typeMap: Record<string, string> = {
      csv: 'csv',
      parquet: 'parquet',
      'text/xml; subtype=gml/2.1.2': 'gdal',
      'geo+json': 'geojson',
      'application/vnd.apache.arrow.stream': 'arrows',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      json: 'json',
    };
    for (const [key, value] of Object.entries(typeMap)) {
      if (contentType.includes(key)) return value;
    }
    return null;
  }

  async loadDatasource(ds: Datasource): Promise<void> {
    await this.clearPreviousDataIfAny();

    this.loadingMode = 'duckdb';
    this.progress.set({
      status: 'connecting',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      contentType: null,
    });
    if (!ds.url) return;

    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    let isHeadOk = false;
    try {
      isHeadOk = await this.checkDatasourceSize(ds.url, signal);
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError') {
        this.progress.update((p) => ({ ...p, status: 'canceled' }));
        return;
      }
    }

    if (!isHeadOk) {
      this.loadingMode = 'browser';
    }

    // Duckdb GDAL can not yet read WFS directly
    if (this.loadingMode === 'browser' || ds.format === 'wfs') {
      // if (this.loadingMode === 'browser') {
      await this.browserDownloadMode(ds, signal);
    } else {
      await this.loadData(this.buildFileName(ds), undefined, ds, signal);
    }
  }

  private async clearPreviousDataIfAny(): Promise<void> {
    if (this.conn) {
      try {
        await this.conn.query('DROP TABLE IF EXISTS data');
      } catch (e) {
        console.warn('Failed to drop data table', e);
      }
    }
  }

  private sanitizeFileName(ds: Datasource): string {
    const name = ds.url.split('/').pop() || 'data';
    return name.replace(/[^a-zA-Z0-9_\-.]/g, '_');
  }

  private buildFileName(ds: Datasource, extension?: string): string {
    const name = this.sanitizeFileName(ds);
    const ext = extension || ds.format;
    if (!name.toLowerCase().endsWith(`.${ext}`)) {
      return `${name}.${ext}`;
    }
    return name;
  }

  private async resolveWfsGetFeatureUrl(ds: Datasource, signal: AbortSignal): Promise<string> {
    const url = new URL(ds.url);

    // Check capabilities to see if JSON is supported
    let outputFormat = 'application/json';
    try {
      const capsUrl = new URL(ds.url);
      capsUrl.searchParams.set('SERVICE', 'WFS');
      capsUrl.searchParams.set('VERSION', '2.0.0');
      capsUrl.searchParams.set('REQUEST', 'GetCapabilities');

      const response = await this.tryFetch(capsUrl.toString(), { signal });
      if (response.ok) {
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/xml');

        const getElements = (el: Element | Document, tagName: string) =>
          Array.from(el.getElementsByTagNameNS('*', tagName));

        const operations = getElements(doc, 'Operation');
        const getFeatureOp = operations.find((op) => op.getAttribute('name') === 'GetFeature');

        if (getFeatureOp) {
          const parameters = getElements(getFeatureOp, 'Parameter');
          const outputFormatParam = parameters.find(
            (p) => p.getAttribute('name') === 'outputFormat',
          );

          if (outputFormatParam) {
            const values = getElements(outputFormatParam, 'Value').map((v) =>
              v.textContent?.trim().toLowerCase(),
            );

            // Preferred JSON formats in order
            const preferredJsonFormats = [
              'application/json',
              'application/geo+json',
              'application/vnd.geo+json',
              'json',
            ];

            const supportedJson = preferredJsonFormats.find((fmt) => values.includes(fmt));

            if (supportedJson) {
              outputFormat = supportedJson;
            } else {
              // If no standard JSON format found, check for any including 'json'
              const fuzzyJson = values.find((v) => v && v.includes('json'));
              outputFormat = fuzzyJson || ''; // Fallback to GML (default) if no JSON found
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to check WFS capabilities, defaulting to JSON', e);
    }

    url.searchParams.set('SERVICE', 'WFS');
    url.searchParams.set('VERSION', '2.0.0');
    url.searchParams.set('REQUEST', 'GetFeature');
    if (ds.layer) {
      url.searchParams.set('TYPENAME', ds.layer);
    }
    if (outputFormat) {
      url.searchParams.set('OUTPUTFORMAT', outputFormat);
    }
    return url.toString();
  }

  /**
   * Browser download mode: download the entire file into memory, then load into DuckDB.
   * It also infers the file type if missing or unknown from data content.
   */
  private async browserDownloadMode(ds: Datasource, signal: AbortSignal) {
    const fileUrl = ds.format === 'wfs' ? await this.resolveWfsGetFeatureUrl(ds, signal) : ds.url;
    try {
      const { buffer, contentType } = await this.downloadDatasource(fileUrl, signal);
      if (signal.aborted) return;

      let inferredExt = this.getFileType(contentType);

      if (!inferredExt) {
        const uint8 = new Uint8Array(buffer, 0, 4);
        if (uint8[0] === 80 && uint8[1] === 65 && uint8[2] === 82 && uint8[3] === 49) {
          inferredExt = 'parquet';
        } else {
          const text = new TextDecoder().decode(buffer.slice(0, 1)).trim();
          if (text === '{' || text === '[') {
            inferredExt = 'json';
          }
        }
      }

      const isCsv =
        inferredExt === 'csv' || ds.format === 'csv' || fileUrl.toLowerCase().includes('.csv');
      const finalBuffer = isCsv ? this.ensureUtf8Encoding(buffer) : buffer;

      const finalFileName = inferredExt
        ? this.buildFileName(ds, inferredExt)
        : this.buildFileName(ds);
      await this.loadData(finalFileName, finalBuffer, ds, signal);
    } catch (e: unknown) {
      if ((e as Error).name === 'AbortError' || signal.aborted) {
        this.progress.update((p) => ({ ...p, status: 'canceled' }));
      } else {
        console.warn(`Failed to load from URL: ${(e as Error)?.message || e}`);
      }
    }
  }

  private ensureUtf8Encoding(buffer: ArrayBuffer): ArrayBuffer {
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      return buffer;
    } catch {
      console.warn('File is not valid UTF-8. Attempting to convert from ISO-8859-1 to UTF-8.');
      const text = new TextDecoder('iso-8859-1').decode(buffer);
      return new TextEncoder().encode(text).buffer;
    }
  }

  buildFromClause(
    reader: string,
    datasource: Datasource | undefined,
    fileName: string,
    hasNoData: boolean,
  ): string {
    const dataTable = `${datasource && hasNoData ? datasource.url : fileName}`;
    if (reader === 'read_xlsx') {
      return `${reader}('${dataTable}', header = true, all_varchar = true)`;
    }
    return `${reader}('${dataTable}')`;
  }

  /**
   * Load data into DuckDB from file URL or ArrayBuffer.
   */
  async loadData(
    fileName: string,
    data?: ArrayBuffer,
    datasource?: Datasource,
    signal?: AbortSignal,
  ): Promise<void> {
    try {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      this.progress.update((p) => ({ ...p, status: 'database' }));
      await this.init();
      if (!this.db || !this.conn) return;

      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      this.progress.update((p) => ({ ...p, status: 'format', progress: p.progress + 10 }));

      const ext = datasource?.format || fileName.split('.').pop()?.toLowerCase() || '';
      const readerMap: Record<string, string> = {
        csv: 'read_csv_auto',
        parquet: 'parquet_scan',
        arrows: 'read_arrow',
        json: 'read_json_auto',
        gdal: 'ST_Read',
        wfs: 'ST_Read',
        geojson: 'ST_Read',
        xlsx: 'read_xlsx',
      };
      const reader = readerMap[ext];
      if (!reader) throw new Error(`Unsupported file type: .${ext}`);

      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      this.progress.update((p) => ({ ...p, status: 'loading', progress: p.progress + 20 }));

      if (data) {
        await this.db.registerFileBuffer(fileName, new Uint8Array(data));
      }

      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const fromClause = this.buildFromClause(reader, datasource, fileName, !data);

      // await this.conn.query("SELECT * FROM st_drivers();").then(function(data) {
      //     const rows = data.toArray();
      //     console.table(rows.map(row => row.toJSON()));
      // });

      // If signal is aborted while query is running, we can't really stop the query easily on duckdb-wasm side
      // without closing connection, but we can check before keeping result.
      await this.conn.query(`CREATE OR REPLACE TABLE data AS SELECT * FROM ${fromClause};`);

      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const countResult = await this.conn.query('SELECT count(*) as count FROM data;');
      console.log(`Loaded ${countResult.get(0)?.['count']} records into DuckDB.`);

      this.progress.update((p) => ({ ...p, status: 'completed', progress: 100 }));
    } catch (error: unknown) {
      const isAbort = (error as Error).name === 'AbortError' || signal?.aborted;
      this.progress.update((p) => ({
        ...p,
        status: isAbort ? 'canceled' : 'error',
        errorMessage: isAbort ? undefined : `Error: ${(error as Error).message}`,
      }));
      if (!isAbort) console.error('Load data error:', error);
    }
  }

  async runQuery(query: string): Promise<Record<string, unknown>[]> {
    const conn = await this.getConnection();
    const result = await conn.query(query);
    const data =
      (await (
        result as unknown as { toArray?: () => { toJSON: () => Record<string, unknown> }[] }
      ).toArray?.()) ?? [];

    return data.map((row) => {
      const newRow: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row.toJSON())) {
        newRow[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return newRow;
    });
  }

  async getGeometryColumns(tableName: string): Promise<string[]> {
    const describe = await this.runQuery(`DESCRIBE ${tableName}`);
    const geometryTypes = ['GEOMETRY', 'POINT', 'LINE', 'POLYGON'];
    return describe
      .filter((row) =>
        geometryTypes.some((type) => (row['column_type'] as string)?.startsWith(type)),
      )
      .map((row) => row['column_name'] as string);
  }

  async getColumnType(query: string, columnName: string): Promise<string | undefined> {
    const conn = await this.getConnection();
    const result = await conn.query(
      `SELECT typeof("${columnName}") AS coltype FROM (${query}) LIMIT 1;`,
    );
    return result.get(0)?.['coltype'];
  }

  async getHistogram(query: string, columnName: string): Promise<unknown> {
    const conn = await this.getConnection();
    const result = await conn.query(`SELECT histogram("${columnName}") AS data FROM (${query});`);
    const data = result.get(0)?.['data'];
    return data?.toJSON?.() ?? null;
  }

  private async tryFetch(url: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (e) {
      // Assuming a network error which might be CORS related.
      // Retry with proxy if configured.
      const proxyUrl = this.appConfig().config?.proxyUrl;
      if (proxyUrl) {
        console.warn(`Fetch failed for ${url}, retrying with proxy...`, e);
        // Encode the target URL component
        const proxiedUrl = `${proxyUrl}${encodeURIComponent(url)}`;
        return await fetch(proxiedUrl, init);
      }
      throw e;
    }
  }
}
