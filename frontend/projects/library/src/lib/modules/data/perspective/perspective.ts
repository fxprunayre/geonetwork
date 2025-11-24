import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import perspective from '@perspective-dev/client';
import perspective_viewer from '@perspective-dev/viewer';
import { Datasource } from '../datasource-select/datasource-select';
import { DuckDbService } from '../duck-db.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidExpand } from '@ng-icons/font-awesome/solid';
import { Button, ButtonIcon } from 'primeng/button';
import { NgClass } from '@angular/common';
import { ProgressBar } from 'primeng/progressbar';
import { RecordsService } from 'gn4-api-client';

@Component({
  selector: 'app-perspective',
  imports: [Button, NgIcon, ProgressBar, NgClass, ButtonIcon],
  viewProviders: [
    provideIcons({
      faSolidExpand,
    }),
  ],
  template: `
    @if (progress().status !== 'completed' && progress().status !== 'idle') {
      <p-progressbar [value]="progress().progress" class="my-4">
        <ng-template #content let-value>
          <span>{{ value }}/100 ({{ progress().status }})</span>
        </ng-template>
      </p-progressbar>
    }
    <div
      #viewerContainer
      class="transition-all duration-300"
      [ngClass]="{
        'fixed inset-0 z-[100] h-screen w-screen bg-white p-4 ': isFullScreen(),
        'relative  min-h-dvh h-full': !isFullScreen(),
      }"
    >
      <p-button (click)="toggleFullScreen()" styleClass="float-right">
        <ng-icon name="faSolidExpand" pButtonIcon />
      </p-button>
      <perspective-viewer #perspectiveViewer class="w-full min-h-dvh h-full" />
    </div>
  `,
  styleUrl: './perspective.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Perspective {
  datasource = input<Datasource | undefined>();

  @ViewChild('perspectiveViewer') perspectiveViewer!: ElementRef<any>;

  private duckDbService = inject(DuckDbService);
  private renderer = inject(Renderer2);

  progress = this.duckDbService.progress;
  isFullScreen = signal(false);
  error: string | undefined;

  private worker: any;
  private readonly initPromise: Promise<any>;

  constructor() {
    this.initPromise = this.initialize();

    effect(async () => {
      const ds = this.datasource();
      if (ds) {
        await this.duckDbService.loadDatasource(ds.url);
        this.loadDataFromQuery();
      }
    });
  }

  toggleFullScreen(): void {
    this.isFullScreen.update((v) => !v);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  }

  private async initialize(): Promise<any> {
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
        this.duckDbService.init(),
        ...scriptUrls.map((url) => this.loadScript(url, true)),
        perspective.init_server(fetch(wasmUrls[0])),
        perspective_viewer.init_client(fetch(wasmUrls[1])),
      ]);
    } catch (e: any) {
      this.error = e.message;
      console.error('Initialization failed:', e);
    }
  }

  private loadScript(url: string, module = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = module ? 'module' : 'text/javascript';
      script.async = false;
      script.onload = () => resolve();
      script.onerror = (err: any) => reject(new Error(`Script load error: ${url}`, { cause: err }));
      this.renderer.appendChild(document.head, script);
    });
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'bigint') {
      const num = Number(data);
      return Number.isSafeInteger(num) ? num : data.toString();
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }
    if (data !== null && typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, this.sanitizeData(value)]),
      );
    }
    return data;
  }

  private async loadDataFromQuery() {
    await this.initPromise;
    this.worker = this.worker || (await perspective.worker());

    try {
      // TODO: Count features and limit rows accordingly
      const result: any = await this.duckDbService.runQuery2('SELECT * FROM data LIMIT 100000');
      let table;

      if (result instanceof ArrayBuffer) {
        table = this.worker.table(result, { type: 'arrow' });
      } else if (Array.isArray(result)) {
        table = this.worker.table(this.sanitizeData(result));
      } else {
        throw new Error('Unexpected result format from DuckDbService');
      }

      this.perspectiveViewer.nativeElement.load(table);
      this.perspectiveViewer.nativeElement.restore({ settings: true });
    } catch (e: any) {
      this.error = e.message;
      console.error('Failed to load data into Perspective:', e);
    }
  }
}
