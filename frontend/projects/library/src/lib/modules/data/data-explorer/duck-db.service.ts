import { Injectable } from '@angular/core';
import * as duckdb from '@duckdb/duckdb-wasm';
import { AsyncDuckDBConnection } from '@duckdb/duckdb-wasm';

@Injectable({
  providedIn: 'root',
})
export class DuckDbService {
  private db?: duckdb.AsyncDuckDB;
  private conn?: duckdb.AsyncDuckDBConnection;
  private initialized = false;

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

  async loadData(fileName: string, data: ArrayBuffer): Promise<void> {
    await this.init();
    if (!this.db || !this.conn) return;

    await this.db.registerFileBuffer(fileName, new Uint8Array(data));

    const ext = (fileName.split('.').pop() || '').toLowerCase();
    let reader: string;
    switch (ext) {
      case 'csv':
        reader = 'read_csv_auto';
        break;
      case 'parquet':
        reader = 'parquet_scan';
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
    await this.conn.query(
      `CREATE OR REPLACE TABLE data AS SELECT * FROM ${reader}('${fileName}');`,
    );
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
