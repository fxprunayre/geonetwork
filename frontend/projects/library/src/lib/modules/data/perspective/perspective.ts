import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidTriangleExclamation, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslateModule } from '@ngx-translate/core';
import { Button, ButtonIcon } from 'primeng/button';
import { FileSelectEvent, FileUploadModule, FileUploadPassThrough } from 'primeng/fileupload';
import { Message } from 'primeng/message';
import { Popover } from 'primeng/popover';
import { ProgressBar } from 'primeng/progressbar';
import { FullScreenPanel } from '../../../shared/widgets/full-screen-panel/full-screen-panel';
import { Datasource } from '../datasource.model';
import { DuckDbService } from '../duck-db-service';
import { SAMPLE_VISUALISATIONS } from './perspective-visualisations';

interface PerspectiveViewerNativeElement {
  delete(): Promise<unknown>;
  load(client: unknown): Promise<unknown>;
  restore(update: Record<string, unknown>, options?: unknown): Promise<void>;
  restoreWorkspace(update: Record<string, unknown>): Promise<void>;
  save(options?: unknown): Promise<unknown>;
  saveWorkspace(): Promise<unknown>;
  flush(): Promise<unknown>;
}

@Component({
  selector: 'app-perspective',
  imports: [
    Button,
    ButtonIcon,
    FileUploadModule,
    FullScreenPanel,
    Message,
    NgIcon,
    NgTemplateOutlet,
    Popover,
    ProgressBar,
    TranslateModule,
  ],
  viewProviders: [
    provideIcons({
      faSolidXmark,
      faSolidTriangleExclamation,
    }),
  ],
  template: `
    <ng-template #progressBarTemplate let-progress="progress">
      @if (progress().status !== 'completed' && progress().status !== 'idle') {
        @let errorOrCancel = progress().status === 'error' || progress().status === 'canceled';
        <p-progressbar
          [mode]="errorOrCancel ? 'determinate' : 'indeterminate'"
          [style]="{ height: '3px' }"
          class="w-full"
        />
        <div class="flex items-center gap-2">
          {{ progress().status }}
          @if (progress().status === 'error' && progress().errorMessage) {
            <p-button (click)="op.toggle($event)" variant="text" severity="danger">
              <ng-icon name="faSolidTriangleExclamation" pButtonIcon></ng-icon>
            </p-button>
            <p-popover #op>
              {{ progress().errorMessage }}
            </p-popover>
          }

          @if (progress().downloadedBytes) {
            - {{ (progress().downloadedBytes / (1024 * 1024)).toFixed(2) }} MB
            @if (progress().totalBytes > 0) {
              / {{ (progress().totalBytes / (1024 * 1024)).toFixed(2) }} MB
            }
          }
          @if (!errorOrCancel) {
            <p-button
              (click)="cancel()"
              [rounded]="true"
              [text]="true"
              severity="danger"
              size="small"
              title="Cancel download"
            >
              <ng-icon name="faSolidXmark" pButtonIcon />
            </p-button>
          }
        </div>
      }
    </ng-template>

    <div class="py-4">
      <ng-container
        *ngTemplateOutlet="
          progressBarTemplate;
          context: {
            progress: progress,
          }
        "
      ></ng-container>

      @if (progress().status === 'completed') {
        <ng-template #perspectiveToolbar>
          <div class="flex flex-row gap-4">
            @let layer = datasource()?.layer;
            @if (layer && visualisation[layer]) {
              <p-button
                (click)="loadVisualisation(layer)"
                variant="outlined"
                [label]="'Load ' + layer + ' visualisation'"
              />
            }
            <p-button (click)="exportWorkspace()" variant="outlined" label="Export visualisation" />
            <p-fileupload
              mode="basic"
              name="workspace[]"
              chooseIcon="pi pi-upload"
              accept="application/json"
              maxFileSize="1000000"
              (onSelect)="restoreWorkspace($event)"
              [auto]="true"
              [pt]="fileUploadPt"
              chooseLabel="Restore visualisation"
            />
          </div>
        </ng-template>

        <app-full-screen-panel
          [normalContainerClass]="'relative h-[60vh]'"
          [contentClass]="'flex flex-col gap-3 h-full min-h-0'"
          [fullScreenContentClass]="'flex-1 h-full min-h-0 flex flex-col gap-3'"
          [toolbarTplRef]="perspectiveToolbar"
        >
          <div class="grow h-full min-h-0 min-w-0">
            <div #viewerContainer class="relative h-full min-h-0 overflow-hidden flex flex-col">
              @if (progress().status === 'completed' && isTruncated()) {
                <p-message
                  [severity]="'warn'"
                  closable
                  title="{{
                    'perspective.largeDataset'
                      | translate: { count: loadedCount(), total: totalCount() }
                  }}"
                >
                  <ng-icon name="faSolidTriangleExclamation" />
                  {{
                    'perspective.largeDataset'
                      | translate: { count: loadedCount(), total: totalCount() }
                  }}
                </p-message>
              }

              <perspective-viewer
                #perspectiveViewer
                theme="GeoNetwork"
                class="block w-full h-full min-h-0"
              />
            </div>
          </div>
        </app-full-screen-panel>
      }
    </div>
  `,
  styleUrl: './perspective.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Perspective implements OnDestroy {
  datasource = input<Datasource | undefined>();

  @ViewChild('perspectiveViewer')
  perspectiveViewer!: ElementRef<PerspectiveViewerNativeElement>;

  private duckDbService = inject(DuckDbService);
  private renderer = inject(Renderer2);

  progress = this.duckDbService.progress;
  isTruncated = signal(false);
  totalCount = signal(0);
  loadedCount = signal(0);
  limit = 100000;
  error: string | undefined;

  private worker: unknown;
  private viewerLoaded = false;
  private readonly sourceTableName = 'data';
  private readonly perspectiveTableName = 'data_view';

  fileUploadPt: FileUploadPassThrough = {
    pcChooseButton: { root: 'p-button-outlined' },
  };

  visualisation: Record<string, unknown> = SAMPLE_VISUALISATIONS;

  constructor() {
    effect(async () => {
      const ds = this.datasource();
      if (ds) {
        await this.initialize();
        await this.clearPreviousDataIfAny();

        await this.duckDbService.loadDatasource(ds);
        await this.loadDataIntoPerspective();
      }
    });
  }

  cancel(): void {
    this.duckDbService.cancelDownload();
  }

  private async clearPreviousDataIfAny(): Promise<void> {
    if (this.perspectiveViewer?.nativeElement?.delete) {
      await this.perspectiveViewer.nativeElement.delete();
      this.viewerLoaded = false;
    }
  }

  private async initialize(): Promise<void> {
    try {
      this.duckDbService.progress.update((p) => ({ ...p, status: 'initializing' }));
      await Promise.all([
        this.duckDbService.init(),
        this.duckDbService.initializePerspective(this.renderer),
      ]);
    } catch (e: unknown) {
      this.error = (e as Error).message;
      console.error('Initialization failed:', e);
    }
  }

  private async loadDataIntoPerspective() {
    const { perspective } = await import('./perspective-init');

    // Import DuckDBHandler dynamically to avoid static dependency cycles with duckdb
    const { DuckDBHandler } =
      await import('@perspective-dev/client/dist/esm/virtual_servers/duckdb.js');

    const duckdbConn = await this.duckDbService.getConnection();
    const countResult = await this.duckDbService.runQuery(
      `SELECT count(*) as count FROM ${this.sourceTableName}`,
    );

    this.totalCount.set(Number(countResult[0]?.['count'] || 0));
    // No more truncation since we use virtual server directly
    this.isTruncated.set(false);
    this.loadedCount.set(this.totalCount());

    // Perspective does not support GEOMETRY columns
    const geomColumns = await this.duckDbService.getGeometryColumns(this.sourceTableName);
    const excludeStatement = geomColumns.length > 0 ? ` EXCLUDE (${geomColumns.join(', ')})` : '';

    // Create a duckdb view without geometries and with a stable row id used by Perspective's DuckDB handler.
    await this.duckDbService.runQuery(
      `CREATE OR REPLACE VIEW ${this.perspectiveTableName} AS SELECT row_number() OVER () AS rowid, *${excludeStatement} FROM ${this.sourceTableName}`,
    );

    const handler = new DuckDBHandler(duckdbConn);
    const port = await perspective.createMessageHandler(handler);
    this.worker = await perspective.worker(Promise.resolve(port));

    if (!this.viewerLoaded && this.perspectiveViewer?.nativeElement?.load) {
      await this.perspectiveViewer.nativeElement.load(this.worker);
      this.viewerLoaded = true;
    }

    await this.perspectiveViewer.nativeElement.restore({
      table: `memory.${this.perspectiveTableName}`,
      plugin: 'Datagrid',
      settings: true,
      theme: 'GeoNetwork',
    });

    await this.perspectiveViewer.nativeElement.flush?.();
  }

  async ngOnDestroy() {
    await this.clearPreviousDataIfAny();
  }

  async loadVisualisation(layer: string) {
    const selectedState = this.visualisation[layer];

    if (!selectedState || typeof selectedState !== 'object') {
      return;
    }

    const restoreConfig = this.withRuntimeTableRef(selectedState as Record<string, unknown>);

    try {
      if (this.isWorkspaceConfig(restoreConfig)) {
        await this.perspectiveViewer.nativeElement.restoreWorkspace(restoreConfig);
      } else {
        await this.perspectiveViewer.nativeElement.restore(restoreConfig);
      }
      await this.perspectiveViewer.nativeElement.flush?.();
    } catch (error) {
      console.error('Failed to load visualisation config:', error, restoreConfig);
    }
  }

  async exportWorkspace() {
    const viewerState = await this.perspectiveViewer.nativeElement.saveWorkspace();
    const blob = new Blob([JSON.stringify(viewerState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perspective_viewer.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  restoreWorkspace(event: FileSelectEvent) {
    const file = event.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const viewerState = JSON.parse(reader.result as string) as Record<string, unknown>;
          const restoreConfig = this.withRuntimeTableRef(viewerState);
          if (this.isWorkspaceConfig(restoreConfig)) {
            void this.perspectiveViewer.nativeElement.restoreWorkspace(restoreConfig);
          } else {
            void this.perspectiveViewer.nativeElement.restore(restoreConfig);
          }
        } catch (e) {
          console.error('Failed to restore workspace:', e);
        }
      };
      reader.readAsText(file);
    }
  }

  private withRuntimeTableRef(config: Record<string, unknown>): Record<string, unknown> {
    const tableName = `memory.${this.perspectiveTableName}`;

    if (config['panels'] && typeof config['panels'] === 'object') {
      const patchedPanels = Object.fromEntries(
        Object.entries(config['panels'] as Record<string, unknown>).map(([id, panel]) => {
          if (!panel || typeof panel !== 'object') {
            return [id, panel];
          }
          return [id, { ...(panel as Record<string, unknown>), table: tableName }];
        }),
      );
      return { ...config, panels: patchedPanels };
    }

    if (config['viewers'] && typeof config['viewers'] === 'object') {
      const patchedViewers = Object.fromEntries(
        Object.entries(config['viewers'] as Record<string, unknown>).map(([id, viewer]) => {
          if (!viewer || typeof viewer !== 'object') {
            return [id, viewer];
          }
          return [id, { ...(viewer as Record<string, unknown>), table: tableName }];
        }),
      );
      return { ...config, viewers: patchedViewers };
    }

    return { ...config, table: tableName };
  }

  private isWorkspaceConfig(config: Record<string, unknown>): boolean {
    return (
      config['layout'] !== undefined &&
      config['panels'] !== undefined &&
      typeof config['panels'] === 'object'
    );
  }
}
