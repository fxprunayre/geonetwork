import { Injectable, signal } from '@angular/core';
import * as duckdb from '@duckdb/duckdb-wasm';
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';
// import * as arrow from 'apache-arrow';


export interface DatasourceLoadingProgress {
  status: 'idle'  | 'connecting' | 'size' | 'downloading' | 'completed' | 'db' | 'format' | 'loading' | 'canceled' | 'error';
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
  private db?: duckdb.AsyncDuckDB;
  private conn?: duckdb.AsyncDuckDBConnection;
  private initialized = false;
  private abortController: AbortController | null = null;

  public progress = signal<DatasourceLoadingProgress>({
    status: 'idle',
    progress: 0,
    downloadedBytes: 0,
    totalBytes: 0,
    contentType: null
  });

  private async createWorkerFromUrl(url: string): Promise<Worker> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch worker script: ${res.status}`);
    const script = await res.text();
    const blob = new Blob([script], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
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

      await this.conn.query('INSTALL json; LOAD json;');
      await this.conn.query('INSTALL spatial; LOAD spatial;');
      await this.conn.query('INSTALL arrow FROM community; LOAD arrow;');

      this.initialized = true;
    } catch (e: any) {
      console.error('Failed to initialize DuckDB', e);
      throw new Error(`Failed to initialize DuckDB: ${e?.message || e}`);
    }
  }

  async getConnection(): Promise<AsyncDuckDBConnection> {
    await this.init();
    if (!this.conn) {
      throw new Error('DuckDB connection not available');
    }
    return this.conn;
  }

  async checkDatasourceSize(fileUrl: string, signal: AbortSignal): Promise<void> {
    let totalBytes = 0;
    const headResponse = await fetch(fileUrl, { method: 'HEAD', signal });
    if (!headResponse.ok) {
      throw new Error(`Erreur HTTP lors de la vérification HEAD: ${headResponse.status}`);
    }

    const contentLengthHeader = headResponse.headers.get('Content-Length');
    const contentType = headResponse.headers.get('Content-Type');
    totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

    this.progress.update(p => ({
      ...p,
      errorMessage: totalBytes === 0 ? "Warning: No idea about the datasource size (Content-Length missing)." : `Downloading ${totalBytes} ...`,
      status: 'downloading',
      progress: 10,
      totalBytes: totalBytes,
      contentType: this.getFileType(contentType)
    }));
  }

  async downloadDatasource(fileUrl: string, signal: AbortSignal): Promise<{buffer: ArrayBuffer, contentType: string}> {
    this.progress.update(p => ({ ...p, status: 'downloading', errorMessage: undefined }));

    const totalBytes = this.progress().totalBytes;
    const response = await fetch(fileUrl, {signal});

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body!.getReader();
    let downloadedBytes = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      chunks.push(value!);
      downloadedBytes += value!.length;

      let progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 50 : 0;

      this.progress.update(p => ({
        ...p,
        downloadedBytes,
        progress: progress
      }));
    }

    this.progress.update(p => ({ ...p, status: 'completed' }));
    const receivedSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);

    const finalBuffer = new Uint8Array(receivedSize);
    let offset = 0;

    for (const chunk of chunks) {
      finalBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    return {buffer: finalBuffer.buffer, contentType: response.headers.get('Content-Type')  ||''};
    }

  cancelDownload(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  getFileType(contentType: string | null): string | null {
    if (!contentType) return null;

    let inferredExt: string | undefined;

    if (contentType.includes('csv')) inferredExt = 'csv';
    else if (contentType.includes('parquet')) inferredExt = 'parquet';
    else if (contentType.includes('text/xml; subtype=gml/2.1.2')) inferredExt = 'gdal';
    else if (contentType.includes('geo+json')) inferredExt = 'geojson';
    else if (contentType.includes('application/vnd.apache.arrow.stream'))
      inferredExt = 'arrows';
    else if (contentType.includes('json')) inferredExt = 'json';

    return inferredExt || null;
  }

  async loadDatasource(fileUrl: string): Promise<void> {
    this.progress.set({
      status: 'connecting',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      contentType: null,
    });

    if (!fileUrl) return;


    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    await this.checkDatasourceSize(fileUrl, signal);

    try {
      const data = await this.downloadDatasource(fileUrl, signal);
      let fileName = fileUrl.split('/').pop() || 'data';
      const fileExt = (fileName.split('.').pop() || '').toLowerCase();
      const supportedExts = ['csv', 'parquet', 'json', 'geojson', 'gml', 'arrows', 'arrow'];

      if (!supportedExts.includes(fileExt)) {
        const contentType = data.contentType;
        let inferredExt = this.getFileType(contentType);

        if (!inferredExt) {
          const uint8 = new Uint8Array(data.buffer, 0, 4);
          if (uint8[0] === 80 && uint8[1] === 65 && uint8[2] === 82 && uint8[3] === 49) {
            inferredExt = 'parquet';
          } else {
            const text = new TextDecoder().decode(data.buffer.slice(0, 1)).trim();
            if (text === '{' || text === '[') {
              inferredExt = 'json';
            }
          }
        }

        if (inferredExt) {
          fileName = `${fileName}.${inferredExt}`;
        } else {
          fileName = `${fileName}.csv`;
        }
      }

      await this.loadData(fileName, data.buffer);
    } catch (e: any) {
      console.warn(`Failed to load from URL: ${e?.message || e}`);
    }
  }

  async loadData(fileName: string, data: ArrayBuffer): Promise<void> {
    try {
      this.progress.update(p => ({
        ... p,
        status: 'db',
      }));

      await this.init();
      if (!this.db || !this.conn) return;

      this.progress.update(p => ({
        ... p,
        status: 'format',
        progress: p.progress + 10
      }));

      const ext = (fileName.split('.').pop() || '').toLowerCase();
      let reader: string;
      switch (ext) {
        case 'csv':
          reader = 'read_csv_auto';
          break;
        case 'parquet':
          reader = 'parquet_scan';
          break;
        case 'arrows':
          reader = 'read_arrow';
          break;
        case 'json':
          reader = 'read_json_auto';
          break;
        case 'gdal':
        case 'geojson':
          reader = 'ST_Read';
          break;
        default:
          throw new Error(`Unsupported file type: .${ext}`);
      }

      this.progress.update(p => ({
        ... p,
        status: 'loading',
        progress: p.progress + 10
      }));

      await this.db.registerFileBuffer(fileName, new Uint8Array(data));

      this.progress.update(p => ({
        ... p,
        progress: p.progress + 10
      }));

      console.log(`CREATE OR REPLACE TABLE data AS SELECT * FROM ${reader}('${fileName}');`);
      await this.conn.query(
        `CREATE OR REPLACE TABLE data AS SELECT * FROM ${reader}('${fileName}');`,
      );

      this.progress.update(p => ({
        ... p,
        status: 'completed',
        progress: 100
      }));
    } catch (error: any) {
      if (error.name === 'AbortError') {
        this.progress.update(p => ({ ...p, status: 'canceled', errorMessage: undefined }));
      } else {
        this.progress.update(p => ({
          ...p,
          status: 'error',
          errorMessage: `Error: ${error.message}`
        }));
        console.error("Download error:", error);
      }
    }
  }

  async runQuery(query: string): Promise<any[]> {
    const conn = await this.getConnection();
    const result = await conn.query(query);
    const data = (await (result as any).toArray?.()) ?? [];

    const processRow = (row: any): any => {
      const newRow: { [key: string]: any } = {};
      for (const [key, value] of Object.entries(row)) {
        newRow[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return newRow;
    };

    return Array.isArray(data) ? data.map(Object.fromEntries).map(processRow) : [];
  }

  async runQuery2(sql: string, preferArrow = true): Promise<ArrayBuffer | any[]> {
    if (!this.initialized) await this.init();
    const conn = await this.getConnection();

    const result = await conn.query(sql);
    // const result = await conn.query(`FROM to_arrow_ipc((${sql}))`);
    // const reader = await arrow.RecordBatchReader.from(
    //   new arrow.ByteStream(result)
    // );
    // const arrowTable = await reader.readAll();

    // If the result object exposes an Arrow export method, prefer it when requested.
    if (preferArrow && result && typeof (result as any).toArrow === 'function') {
      try {
        const arrowLike = await (result as any).toArrow();
        const ab = this.toArrayBufferCopy(arrowLike);
        if (ab) return ab;
      } catch (err) {
        console.warn('Arrow export failed, falling back to rows:', err);
      }
    }

    // If the result exposes toArray or similar
    if (result && typeof result.toArray === 'function') {
      return result.toArray();
    }

    // If query returned a raw JS array
    if (Array.isArray(result)) return result;

    // If result has .data or .rows, normalize
    if (result && Array.isArray((result as any).rows)) return (result as any).rows;
    if (result && Array.isArray((result as any).data)) return (result as any).data;

    // As a last resort try to convert tabular object to rows
    if (result && typeof result === 'object') {
      const maybeRows = Object.values(result).filter((v) => typeof v === 'object');
      if (maybeRows.length) return maybeRows as any[];
    }

    return [];
  }

  private toArrayBufferCopy(arrowLike: any): ArrayBuffer | null {
    if (!arrowLike) return null;
    if (arrowLike instanceof ArrayBuffer) return arrowLike;
    if (ArrayBuffer.isView(arrowLike)) {
      const view = arrowLike as ArrayBufferView;
      return new Uint8Array(
        view.buffer,
        view.byteOffset || 0,
        view.byteLength || view.buffer.byteLength,
      ).slice().buffer;
    }
    if (typeof SharedArrayBuffer !== 'undefined' && arrowLike instanceof SharedArrayBuffer) {
      return new Uint8Array(arrowLike as any).slice().buffer;
    }
    try {
      const u8 = new Uint8Array(arrowLike);
      return u8.slice().buffer;
    } catch {
      return null;
    }
  }

  async getColumnType(query: string, columnName: string): Promise<string | undefined> {
    const conn = await this.getConnection();
    const typeResult = await conn.query(
      `SELECT typeof("${columnName}") AS coltype FROM (${query}) LIMIT 1;`,
    );
    return typeResult.get(0)?.[`coltype`];
  }

  async getHistogram(query: string, columnName: string): Promise<any> {
    const conn = await this.getConnection();
    const histResult = await conn.query(
      `SELECT histogram("${columnName}") AS data FROM (${query});`,
    );
    const histData = histResult.get(0)?.[`data`];
    return histData && typeof histData.toJSON === 'function' ? histData.toJSON() : null;
  }
}
