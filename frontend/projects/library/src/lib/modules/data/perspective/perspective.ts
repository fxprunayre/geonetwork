import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import perspective from '@perspective-dev/client';
import perspective_viewer from '@perspective-dev/viewer';
import { Datasource } from '../datasource-select/datasource-select';

@Component({
  selector: 'app-perspective',
  imports: [],
  template: `
    <perspective-viewer #perspectiveViewer class="w-full min-h-dvh h-full"></perspective-viewer>
  `,
  styleUrl: './perspective.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Perspective {
  datasource = input<Datasource | undefined>();

  @ViewChild('perspectiveViewer') perspectiveViewer!: ElementRef<any>;

  worker: any;
  initPromise: Promise<void>;

  private renderer = inject(Renderer2);

  constructor() {
    // start initialization and keep the promise
    this.initPromise = this.initPerspective();

    effect(() => {
      const ds = this.datasource();
      if (!ds) return;
      this.loadFileFromUrl(ds);
    });
  }

  loadScript(url: string, module = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = module ? 'module' : 'text/javascript';
      script.async = false;
      script.crossOrigin = 'anonymous'; // important for useful error messages and sourcemap/CORS
      script.onload = () => resolve();
      script.onerror = (ev: any) => {
        console.error('Script load error:', { url, ev });
        reject(new Error(`Failed to load script: ${url}`));
      };
      this.renderer.appendChild(document.head, script);
    });
  }

  async initPerspective(): Promise<void> {
    try {
      const scriptsToLoad = [
        {
          url: 'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-datagrid/dist/cdn/perspective-viewer-datagrid.js',
          module: true,
        },
        {
          url: 'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-d3fc/dist/cdn/perspective-viewer-d3fc.js',
          module: true,
        },
        {
          url: 'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer-openlayers/dist/cdn/perspective-viewer-openlayers.js',
          module: true,
        },
      ];

      for (const { url, module } of scriptsToLoad) {
        await this.loadScript(url, module);
      }

      const SERVER_WASM =
        'https://cdn.jsdelivr.net/npm/@perspective-dev/server/dist/wasm/perspective-server.wasm';
      const CLIENT_WASM =
        'https://cdn.jsdelivr.net/npm/@perspective-dev/viewer/dist/wasm/perspective-viewer.wasm';

      await Promise.all([
        perspective.init_server(fetch(SERVER_WASM)),
        perspective_viewer.init_client(fetch(CLIENT_WASM)),
      ]);
    } catch (err: any) {
      console.error('Perspective init failed:', err);
    }
  }

  async loadFileFromUrl(ds: Datasource) {
    await this.initPromise;

    if (!this.worker) {
      this.worker = await perspective.worker();
      this.perspectiveViewer.nativeElement.restore({ theme: 'Main' });
    }

    const resp = await fetch(ds.url);
    const data = await resp.arrayBuffer();

    const opts = ds.format === 'csv' ? { format: 'csv' } : undefined;
    const table = opts ? this.worker.table(data, opts) : this.worker.table(data);

    this.perspectiveViewer.nativeElement.load(table);
    this.perspectiveViewer.nativeElement.restore({ settings: true, plugin_config: {} });
  }
}
