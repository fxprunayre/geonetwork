import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  faSolidExpand,
  faSolidPlay,
  faSolidUpload,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { Textarea } from 'primeng/textarea';
import { AutoFocus } from 'primeng/autofocus';
import { LoadingMask } from '../../../shared/widgets/loading-mask/loading-mask.component';
import { Select } from 'primeng/select';
import { UIChart } from 'primeng/chart';
import { NgTemplateOutlet } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { Panel } from 'primeng/panel';
import { Drawer } from 'primeng/drawer';
import { DuckDbService } from './duck-db.service';
import { IndexRecord, Link } from 'gn-api-client';
import { Slider } from 'primeng/slider';

interface Datasource {
  url: string;
  format: 'csv' | 'parquet' | 'json' | 'geojson' | 'gml' | 'wfs';
}

@Component({
  selector: 'app-data-explorer',
  templateUrl: './data-explorer.html',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    MultiSelectModule,
    MessageModule,
    NgIconComponent,
    Textarea,
    AutoFocus,
    LoadingMask,
    Select,
    Drawer,
    UIChart,
    InputText,
    InputGroup,
    FileUpload,
    Panel,
    Slider,
    NgTemplateOutlet,
  ],
  providers: [provideIcons({ faSolidPlay, faSolidXmark, faSolidExpand, faSolidUpload })],
})
export class DataExplorer {
  record = input<IndexRecord>();

  datasources = computed(() => {
    const supportedLinks: Datasource[] = [];
    const record = this.record();
    if (!record) return supportedLinks;

    record.link?.forEach((link: Link) => {
      const url = link.urlObject?.['default'] || '';
      const protocol = link.protocol || '';
      const extension = url.split('.').pop()?.toLowerCase();
      if (protocol.startsWith('WWW:DOWNLOAD') && extension === 'parquet') {
        supportedLinks.push({ url: url, format: 'parquet' });
      } else if (protocol.startsWith('WWW:DOWNLOAD') && extension === 'csv') {
        supportedLinks.push({ url: url, format: 'csv' });
      } else if (
        protocol.startsWith('WWW:DOWNLOAD') &&
        (extension === 'json' || url.indexOf('f=pjson') != -1)
      ) {
        supportedLinks.push({ url: url, format: 'json' });
      } else if (protocol.startsWith('WWW:DOWNLOAD') && extension === 'gml') {
        supportedLinks.push({ url: url, format: 'gml' });
      }
    });

    return supportedLinks;
  });

  private duckDbService = inject(DuckDbService);

  initialized = false;
  dataLoaded = false;
  loading = false;
  isFullScreen = false;

  fileUrl = '';
  defaultQuery = 'SELECT * FROM data LIMIT 100';
  query = this.defaultQuery;
  columns: { field: string; header: string }[] = [];
  rows: any[] = [];
  error?: string;

  // Row count and limit
  rowCount = signal<number | null>(null);
  limit = signal(100);
  step = computed(() => {
    const count = this.rowCount();
    return count ? count / 10 : 10;
  });

  // For statistics
  selectedColumnsForStats: string[] = [];
  stats: any[] = [];
  statsColumns: { field: string; header: string }[] = [];
  statsLoading = false;

  // For column analysis (histogram/distinct)
  selectedColumnForAnalysis: string | null = null;
  analysisLoading = false;
  analysisType: 'histogram' | 'distinct' | null = null;
  analysisData: any;
  analysisOptions: any;
  analysisDistinctColumns: { field: string; header: string }[] = [];

  // For two-column chart
  selectedColumnX: string | null = null;
  selectedColumnY: string | null = null;
  twoColumnChartData: any;
  twoColumnChartOptions: any;
  twoColumnChartLoading = false;

  constructor() {
    this.initDuckDB();

    effect(() => {
      this.query = this.replaceLimitClause(this.query, this.limit());
    });
  }

  async initDuckDB(): Promise<void> {
    try {
      await this.duckDbService.init();
      this.initialized = true;
    } catch (e: any) {
      this.error = e.message;
    }
  }

  private resetState(): void {
    this.rows = [];
    this.columns = [];
    this.stats = [];
    this.statsColumns = [];
    this.selectedColumnsForStats = [];
    this.selectedColumnForAnalysis = null;
    this.analysisType = null;
    this.analysisData = null;
    this.selectedColumnX = null;
    this.selectedColumnY = null;
    this.twoColumnChartData = null;
  }

  private async updateRowCount(): Promise<void> {
    try {
      const res = await this.duckDbService.runQuery('SELECT COUNT(*) AS count FROM data;');
      if (res && res.length > 0 && res[0].count !== undefined) {
        this.rowCount.set(Number(res[0].count));
      } else {
        this.rowCount.set(null);
      }
    } catch (e: any) {
      // If counting fails, keep null and do not block loading
      this.rowCount.set(null);
    }
  }

  private replaceLimitClause(sql: string, limit: number): string {
    const trimmed = sql.trim();
    const hasLimit = /LIMIT\s+\d+/i.test(trimmed);
    if (hasLimit) {
      return trimmed.replace(/LIMIT\s+\d+/i, `LIMIT ${limit}`);
    } else {
      return `${trimmed} LIMIT ${limit}`;
    }
  }

  async setLimit(newLimit: number): Promise<void> {
    const max = this.rowCount() ?? Number.MAX_SAFE_INTEGER;
    const clamped = Math.max(0, Math.min(newLimit, max));
    this.limit.set(clamped);
    this.query = this.replaceLimitClause(this.query, this.limit());
    await this.runQuery();
  }

  private async loadData(fileName: string, data: ArrayBuffer): Promise<void> {
    this.dataLoaded = false;
    this.loading = true;
    this.error = undefined;
    this.resetState();

    try {
      await this.duckDbService.loadData(fileName, data);

      await this.updateRowCount();
      const count = this.rowCount();
      this.limit.set(count !== null ? Math.min(100, count) : 100);

      this.query = this.replaceLimitClause(this.query, this.limit());
      this.dataLoaded = true;
      await this.runQuery();
    } catch (e: any) {
      this.error = `Failed to load file: ${e?.message || e}`;
      this.dataLoaded = false;
    } finally {
      this.loading = false;
    }
  }

  async onFileSelected(ev: FileUploadHandlerEvent): Promise<void> {
    const file = ev.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      await this.loadData(file.name, buffer);
    } catch (e: any) {
      this.error = `Failed to read file: ${e?.message || e}`;
    } finally {
      if (ev.files) ev.files.length = 0;
    }
  }

  async loadFileFromUrl(): Promise<void> {
    if (!this.fileUrl) return;

    try {
      const response = await fetch(this.fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      let fileName = this.fileUrl.split('/').pop() || 'data';
      const fileExt = (fileName.split('.').pop() || '').toLowerCase();
      const supportedExts = ['csv', 'parquet', 'json', 'geojson', 'gml'];

      if (!supportedExts.includes(fileExt)) {
        const contentType = response.headers.get('Content-Type');
        let inferredExt: string | undefined;

        if (contentType) {
          if (contentType.includes('csv')) inferredExt = 'csv';
          else if (contentType.includes('parquet')) inferredExt = 'parquet';
          else if (contentType.includes('text/xml; subtype=gml/2.1.2')) inferredExt = 'gdal';
          else if (contentType.includes('geo+json')) inferredExt = 'geojson';
          else if (contentType.includes('json')) inferredExt = 'json';
        }

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

        if (inferredExt) {
          fileName = `${fileName}.${inferredExt}`;
        } else {
          fileName = `${fileName}.csv`;
        }
      }

      await this.loadData(fileName, buffer);
    } catch (e: any) {
      this.error = `Failed to load from URL: ${e?.message || e}`;
    }
  }

  async runQuery(): Promise<void> {
    if (!this.initialized) {
      this.error = 'DuckDB not initialized';
      return;
    }
    this.loading = true;
    this.error = undefined;
    this.resetState();

    try {
      this.rows = await this.duckDbService.runQuery(this.query);
      if (this.rows.length > 0) {
        this.columns = Object.keys(this.rows[0]).map((key) => ({ field: key, header: key }));
      } else {
        this.columns = [];
      }
    } catch (e: any) {
      this.error = `Query failed: ${e?.message || e}`;
      this.rows = [];
      this.columns = [];
    } finally {
      this.loading = false;
    }
  }

  async calculateStats(): Promise<void> {
    if (!this.selectedColumnsForStats.length) {
      this.stats = [];
      this.statsColumns = [];
      return;
    }
    this.statsLoading = true;
    this.error = undefined;
    try {
      const cols = this.selectedColumnsForStats.join(', ');
      const statsQuery = `SUMMARIZE SELECT ${cols} FROM (${this.query})`;
      this.stats = await this.duckDbService.runQuery(statsQuery);

      if (this.stats.length > 0) {
        this.statsColumns = Object.keys(this.stats[0]).map((key) => ({ field: key, header: key }));
      } else {
        this.statsColumns = [];
      }
    } catch (e: any) {
      this.error = `Statistics query failed: ${e?.message || e}`;
      this.stats = [];
      this.statsColumns = [];
    } finally {
      this.statsLoading = false;
    }
  }

  async analyzeColumn(): Promise<void> {
    if (!this.selectedColumnForAnalysis) return;

    this.analysisLoading = true;
    this.error = undefined;
    this.analysisType = null;
    this.analysisData = null;

    try {
      const col = this.selectedColumnForAnalysis;
      const type = await this.duckDbService.getColumnType(this.query, col);

      const numericTypes = ['BIGINT', 'DOUBLE', 'INTEGER', 'FLOAT', 'DECIMAL'];
      if (type && numericTypes.some((t) => type.startsWith(t))) {
        this.analysisType = 'histogram';
        const histMap = await this.duckDbService.getHistogram(this.query, col);

        if (histMap) {
          this.analysisData = {
            labels: Object.keys(histMap).map((key: any) => Number(key).toFixed(2)),
            datasets: [
              {
                label: `Histogram of ${col}`,
                data: Object.values(histMap).map((val: any) => Number(val)),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1,
              },
            ],
          };
        } else {
          this.analysisData = null;
        }
        this.analysisOptions = { scales: { y: { beginAtZero: true } } };
      } else {
        this.analysisType = 'distinct';
        const distinctQuery = `SELECT "${col}", COUNT(*) AS count
                               FROM (${this.query})
                               GROUP BY 1
                               ORDER BY 2 DESC
                               LIMIT 50;`;
        this.analysisData = await this.duckDbService.runQuery(distinctQuery);
        this.analysisDistinctColumns = [
          { field: col, header: col },
          { field: 'count', header: 'Count' },
        ];
      }
    } catch (e: any) {
      this.error = `Column analysis failed: ${e?.message || e}`;
    } finally {
      this.analysisLoading = false;
    }
  }

  async generateTwoColumnChart(): Promise<void> {
    if (!this.selectedColumnX || !this.selectedColumnY) return;

    this.twoColumnChartLoading = true;
    this.error = undefined;
    this.twoColumnChartData = null;

    try {
      const colX = this.selectedColumnX;
      const colY = this.selectedColumnY;

      const chartQuery = `SELECT "${colX}", "${colY}"
                          FROM (${this.query});`;
      const data = await this.duckDbService.runQuery(chartQuery);

      this.twoColumnChartData = {
        datasets: [
          {
            label: `${colY} vs ${colX}`,
            data: data.map((row: any) => ({ x: row[colX], y: row[colY] })),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ],
      };

      this.twoColumnChartOptions = {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: colX,
            },
          },
          y: {
            title: {
              display: true,
              text: colY,
            },
          },
        },
      };
    } catch (e: any) {
      this.error = `Failed to generate chart: ${e?.message || e}`;
    } finally {
      this.twoColumnChartLoading = false;
    }
  }
}
