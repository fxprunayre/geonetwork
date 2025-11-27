import { inject, Injectable, Renderer2, signal } from '@angular/core';
import * as duckdb from '@duckdb/duckdb-wasm';
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
import { IndexRecord, Link } from 'gn-api-client';
import perspective from '@perspective-dev/client';
import perspective_viewer from '@perspective-dev/viewer';

export interface Datasource {
  url: string;
  format: 'csv' | 'parquet' | 'json' | 'geojson' | 'gml' | 'wfs' | 'arrow' | 'gdal';
  layer?: string;
}

export interface DatasourceLoadingProgress {
  status:
    | 'idle'
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
      const logger = new duckdb.ConsoleLogger();
      const bundles = await duckdb.selectBundle(duckdb.getJsDelivrBundles());
      const worker = await this.createWorkerFromUrl(bundles.mainWorker as string);
      this.db = new duckdb.AsyncDuckDB(logger, worker);
      await this.db.instantiate(bundles.mainModule);
      this.conn = await this.db.connect();

      await this.conn.query(`
        INSTALL json; LOAD json;
        INSTALL spatial; LOAD spatial;
      `);
      // INSTALL arrow FROM community; LOAD arrow;

      this.initialized = true;
    } catch (e: any) {
      const errorMessage = `DuckDB initialization failed: ${e?.message || e}`;
      console.error(errorMessage, e);
      throw new Error(errorMessage);
    }
  }

  async initializePerspective(renderer: Renderer2): Promise<any> {
    if (this.perspectiveInitialized) return;

    try {
      const scriptUrls = [
        'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-datagrid/dist/cdn/perspective-viewer-datagrid.js',
        'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-d3fc/dist/cdn/perspective-viewer-d3fc.js',
        'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-openlayers/dist/cdn/perspective-viewer-openlayers.js',
      ];
      const wasmUrls = [
        'https://cdn.jsdelivr.net/npm/@perspective-dev/server/dist/wasm/perspective-server.wasm',
        'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer/dist/wasm/perspective-viewer.wasm',
      ];

      await Promise.all([
        ...scriptUrls.map((url) => this.loadScript(url, true, renderer)),
        perspective.init_server(fetch(wasmUrls[0])),
        perspective_viewer.init_client(fetch(wasmUrls[1])),
      ]);

      this.perspectiveInitialized = true;
    } catch (e: any) {
      const errorMessage = `Perspective initialization failed: ${e?.message || e}`;
      console.error(errorMessage, e);
      throw new Error(errorMessage);
    }
  }

  private loadScript(url: string, module = false, renderer: Renderer2): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.head.querySelector(`script[src="${url}"]`)) {
        resolve();
        return;
      }
      const script = renderer.createElement('script');
      script.src = url;
      script.type = module ? 'module' : 'text/javascript';
      script.async = false;
      script.onload = () => resolve();
      script.onerror = (err: any) => reject(new Error(`Script load error: ${url}`, { cause: err }));
      renderer.appendChild(document.head, script);
    });
  }

  async getConnection(): Promise<AsyncDuckDBConnection> {
    await this.init();
    if (!this.conn) {
      throw new Error('DuckDB connection not available');
    }
    return this.conn;
  }

  getSupportedDatasource(record: IndexRecord): Datasource[] {
    if (!record?.link) return [];

    return record.link.reduce((acc: Datasource[], link: Link) => {
      const url = link.urlObject?.['default'] || '';
      const protocol = link.protocol || '';
      const extension = url.split('.').pop()?.toLowerCase();

      if (protocol.startsWith('OGC:WFS')) {
        const layerName = link.nameObject?.['default'] || '';
        acc.push({ url, format: 'wfs', layer: layerName });
      } else if (protocol.startsWith('WWW:DOWNLOAD')) {
        const formatMapping: { [key: string]: Datasource['format'] } = {
          arrow: 'arrow',
          parquet: 'parquet',
          csv: 'csv',
          gml: 'gml',
        };
        if (extension && formatMapping[extension]) {
          acc.push({ url, format: formatMapping[extension] });
        } else if (extension === 'json' || url.includes('f=pjson')) {
          acc.push({ url, format: 'json' });
        }
      }
      return acc;
    }, []);
  }

  async checkDatasourceSize(fileUrl: string, signal: AbortSignal): Promise<void> {
    const headResponse = await fetch(fileUrl, { method: 'HEAD', signal });
    if (!headResponse.ok) {
      throw new Error(`HTTP HEAD check failed: ${headResponse.status}`);
    }

    const contentLength = headResponse.headers.get('Content-Length');
    const contentType = headResponse.headers.get('Content-Type');
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
  }

  async downloadDatasource(
    fileUrl: string,
    signal: AbortSignal,
  ): Promise<{ buffer: ArrayBuffer; contentType: string }> {
    this.progress.update((p) => ({ ...p, status: 'downloading', errorMessage: undefined }));
    const response = await fetch(fileUrl, { signal });

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
  }

  getFileType(contentType: string | null): string | null {
    if (!contentType) return null;
    const typeMap: { [key: string]: string } = {
      csv: 'csv',
      parquet: 'parquet',
      'text/xml; subtype=gml/2.1.2': 'gdal',
      'geo+json': 'geojson',
      'application/vnd.apache.arrow.stream': 'arrows',
      json: 'json',
    };
    for (const [key, value] of Object.entries(typeMap)) {
      if (contentType.includes(key)) return value;
    }
    return null;
  }

  async loadDatasource(ds: Datasource): Promise<void> {
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
    await this.checkDatasourceSize(ds.url, signal);

    const fileName = this.buildFileName(ds);

    if (this.loadingMode === 'browser' || ds.format === 'wfs') {
      await this.browserDownloadMode(ds, fileName, signal);
    } else {
      await this.loadData(fileName, undefined, ds);
    }
  }

  private buildFileName(ds: Datasource): string {
    const name = ds.url.split('/').pop() || 'data';
    return `${name}.${ds.format}`;
  }

  private buildWfsGetFeatureUrl(ds: Datasource): string {
    const url = new URL(ds.url);
    url.searchParams.set('SERVICE', 'WFS');
    url.searchParams.set('VERSION', '2.0.0');
    url.searchParams.set('REQUEST', 'GetFeature');
    if (ds.layer) {
      url.searchParams.set('TYPENAME', ds.layer);
    }
    url.searchParams.set('OUTPUTFORMAT', 'application/json');
    return url.toString();
  }

  /**
   * Browser download mode: download the entire file into memory, then load into DuckDB.
   * It also infers the file type if missing or unknown from data content.
   */
  private async browserDownloadMode(ds: Datasource, fileName: string, signal: AbortSignal) {
    const fileUrl = ds.format === 'wfs' ? this.buildWfsGetFeatureUrl(ds) : ds.url;
    try {
      const { buffer, contentType } = await this.downloadDatasource(fileUrl, signal);
      let inferredExt = this.getFileType(contentType);

      if (!inferredExt) {
        const uint8 = new Uint8Array(buffer, 0, 4);
        if (uint8[0] === 80 && uint8[1] === 65 && uint8[2] === 82 && uint8[3] === 49) {
          // 'PAR1'
          inferredExt = 'parquet';
        } else {
          const text = new TextDecoder().decode(buffer.slice(0, 1)).trim();
          if (text === '{' || text === '[') {
            inferredExt = 'json';
          }
        }
      }

      const finalFileName = inferredExt ? `${fileName}.${inferredExt}` : `${fileName}.csv`;
      await this.loadData(finalFileName, buffer, ds);
    } catch (e: any) {
      console.warn(`Failed to load from URL: ${e?.message || e}`);
    }
  }

  /**
   * Load data into DuckDB from file URL or ArrayBuffer.
   */
  async loadData(fileName: string, data?: ArrayBuffer, datasource?: Datasource): Promise<void> {
    try {
      this.progress.update((p) => ({ ...p, status: 'database' }));
      await this.init();
      if (!this.db || !this.conn) return;

      this.progress.update((p) => ({ ...p, status: 'format', progress: p.progress + 10 }));

      const ext = datasource?.format || fileName.split('.').pop()?.toLowerCase() || '';
      const readerMap: { [key: string]: string } = {
        csv: 'read_csv_auto',
        parquet: 'parquet_scan',
        arrows: 'read_arrow',
        json: 'read_json_auto',
        gdal: 'ST_Read',
        wfs: 'ST_Read',
        geojson: 'ST_Read',
      };
      const reader = readerMap[ext];
      if (!reader) throw new Error(`Unsupported file type: .${ext}`);

      this.progress.update((p) => ({ ...p, status: 'loading', progress: p.progress + 20 }));

      if (data) {
        await this.db.registerFileBuffer(fileName, new Uint8Array(data));
      }

      const fromClause = `${reader}('${datasource && !data ? datasource.url : fileName}')`;
      await this.conn.query(`CREATE OR REPLACE TABLE data AS SELECT * FROM ${fromClause};`);

      const countResult = await this.conn.query('SELECT count(*) as count FROM data;');
      console.log(`Loaded ${countResult.get(0)?.['count']} records into DuckDB.`);

      this.progress.update((p) => ({ ...p, status: 'completed', progress: 100 }));
    } catch (error: any) {
      const isAbort = error.name === 'AbortError';
      this.progress.update((p) => ({
        ...p,
        status: isAbort ? 'canceled' : 'error',
        errorMessage: isAbort ? undefined : `Error: ${error.message}`,
      }));
      if (!isAbort) console.error('Load data error:', error);
    }
  }

  async runQuery(query: string): Promise<any[]> {
    const conn = await this.getConnection();
    const result = await conn.query(query);
    const data = (await (result as any).toArray?.()) ?? [];

    return data.map((row: any) => {
      const newRow: { [key: string]: any } = {};
      for (const [key, value] of Object.entries(row.toJSON())) {
        newRow[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return newRow;
    });
  }

  async getGeometryColumns(tableName: string): Promise<string[]> {
    const describe = await this.runQuery(`DESCRIBE ${tableName}`);
    const geometryTypes = new Set(['GEOMETRY', 'POINT', 'LINE', 'POLYGON']);
    return describe
      .filter((row) => geometryTypes.has(row.column_type))
      .map((row) => row.column_name);
  }

  async getColumnType(query: string, columnName: string): Promise<string | undefined> {
    const conn = await this.getConnection();
    const result = await conn.query(
      `SELECT typeof("${columnName}") AS coltype FROM (${query}) LIMIT 1;`,
    );
    return result.get(0)?.['coltype'];
  }

  async getHistogram(query: string, columnName: string): Promise<any> {
    const conn = await this.getConnection();
    const result = await conn.query(`SELECT histogram("${columnName}") AS data FROM (${query});`);
    const data = result.get(0)?.['data'];
    return data?.toJSON?.() ?? null;
  }
}
