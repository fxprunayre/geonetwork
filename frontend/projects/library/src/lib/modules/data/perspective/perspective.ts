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

interface PerspectiveWorkspaceNativeElement {
  clear(): Promise<void>;
  load(worker: unknown): Promise<void>;
  addViewer(config: { table: string; settings: boolean; theme: string }): void;
  flush(): Promise<void>;
  restore(workspace: unknown): void;
  workspace: { save(): Promise<unknown> };
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
          [contentClass]="'flex flex-col gap-3'"
          [fullScreenContentClass]="'flex-1 min-h-0 flex flex-col gap-3'"
          [toolbarTplRef]="perspectiveToolbar"
        >
          <div class="grow min-h-0">
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

              <perspective-workspace #perspectiveWorkspace theme="GeoNetwork" class="w-full grow" />
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

  @ViewChild('perspectiveWorkspace')
  perspectiveWorkspace!: ElementRef<PerspectiveWorkspaceNativeElement>;

  private duckDbService = inject(DuckDbService);
  private renderer = inject(Renderer2);

  progress = this.duckDbService.progress;
  isTruncated = signal(false);
  totalCount = signal(0);
  loadedCount = signal(0);
  limit = 100000;
  error: string | undefined;

  private worker: unknown;
  private table: unknown;
  private workspaceLoaded = false;
  private readonly tableName = 'data';

  fileUploadPt: FileUploadPassThrough = {
    pcChooseButton: { root: 'p-button-outlined' },
  };

  visualisation: Record<string, unknown> = {
    IFR_LOCATION_PORTS: {
      sizes: [0.25, 0.75],
      detail: {
        main: {
          type: 'split-area',
          orientation: 'horizontal',
          children: [
            {
              type: 'tab-area',
              widgets: ['PERSPECTIVE_GENERATED_ID_0'],
              currentIndex: 0,
            },
            {
              type: 'tab-area',
              widgets: ['PERSPECTIVE_GENERATED_ID_1'],
              currentIndex: 0,
            },
          ],
          sizes: [0.5, 0.5],
        },
      },
      viewers: {
        PERSPECTIVE_GENERATED_ID_2: {
          version: '4.4.1',
          columns_config: {},
          plugin: 'Datagrid',
          plugin_config: {
            columns: {},
            scroll_lock: false,
            edit_mode: 'SELECT_ROW_TREE',
          },
          settings: false,
          table: 'data',
          theme: null,
          title: null,
          group_by: ['Country', 'Status'],
          split_by: [],
          sort: [],
          filter: [],
          group_rollup_mode: 'rollup',
          expressions: {},
          columns: ['id'],
          aggregates: {},
        },
        PERSPECTIVE_GENERATED_ID_0: {
          version: '4.4.1',
          columns_config: {},
          plugin: 'Map Scatter',
          plugin_config: {
            center: [333110.2341381438, 2510973.7509061927],
            zoom: 5,
          },
          settings: false,
          table: 'data',
          theme: null,
          title: null,
          group_by: [],
          split_by: ['Country'],
          sort: [],
          filter: [['Country', '==', 'FRA']],
          group_rollup_mode: 'rollup',
          expressions: {},
          columns: ['Longitude', 'Latitude', null, null, 'Name', 'LOCODE', 'Group', 'Status'],
          aggregates: {},
        },
        PERSPECTIVE_GENERATED_ID_1: {
          version: '4.4.1',
          columns_config: {},
          plugin: 'Sunburst',
          plugin_config: {
            sunburstLevel: {},
          },
          settings: false,
          table: 'data',
          theme: null,
          title: null,
          group_by: ['Status'],
          split_by: [],
          sort: [],
          filter: [['Country', '==', 'FRA']],
          group_rollup_mode: 'flat',
          expressions: {},
          columns: ['OGC_FID', 'Status', null],
          aggregates: {
            OGC_FID: 'count',
          },
        },
      },
      master: {
        widgets: ['PERSPECTIVE_GENERATED_ID_2'],
        sizes: [1],
      },
    },
    sno_memo: {
      sizes: [0.25, 0.75],
      detail: {
        main: {
          type: 'tab-area',
          widgets: ['map'],
          currentIndex: 0,
        },
      },
      viewers: {
        table: {
          version: '4.4.1',
          columns_config: {},
          plugin: 'Datagrid',
          plugin_config: {
            columns: {},
            scroll_lock: false,
            edit_mode: 'SELECT_ROW_TREE',
          },
          settings: false,
          table: 'data',
          theme: null,
          title: 'Individus',
          group_by: ['Nom_deploi', 'Nom_indivi'],
          split_by: [],
          sort: [],
          filter: [],
          group_rollup_mode: 'rollup',
          expressions: {},
          columns: ['Date', 'Latitude', 'Longitude', 'Variables'],
          aggregates: {
            Date: 'last by index',
            Longitude: 'high minus low',
            Variables: 'dominant',
            Latitude: 'high minus low',
          },
        },
        map: {
          version: '4.4.1',
          columns_config: {},
          plugin: 'Map Scatter',
          plugin_config: {
            center: [-1500901.6277789047, -3924407.7503462345],
            zoom: 2,
          },
          settings: false,
          table: 'data',
          theme: null,
          title: 'Map',
          group_by: [],
          split_by: ['Nom_indivi'],
          sort: [['Nom_indivi', 'asc']],
          filter: [['Nom_deploi', '==', 'ct139']],
          group_rollup_mode: 'rollup',
          expressions: {},
          columns: ['Latitude', 'Longitude', null, null, 'Nom_deploi', 'Nom_indivi', 'Variables'],
          aggregates: {},
        },
      },
      master: {
        widgets: ['table'],
        sizes: [1],
      },
    },
  };

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
    const tbl = this.table as { delete?: () => Promise<void> } | undefined;
    if (tbl?.delete) {
      await tbl.delete();
      this.table = undefined;
    }
    if (this.perspectiveWorkspace?.nativeElement?.clear) {
      await this.perspectiveWorkspace.nativeElement.clear();
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

  private sanitizeData(data: unknown): unknown {
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

  private async loadDataIntoPerspective() {
    const { perspective } = await import('./perspective-init');
    this.worker = this.worker || (await perspective.worker());

    if (!this.workspaceLoaded && this.perspectiveWorkspace?.nativeElement?.load) {
      await this.perspectiveWorkspace.nativeElement.load(this.worker);
      this.workspaceLoaded = true;
    }

    const countResult = await this.duckDbService.runQuery('SELECT count(*) as count FROM data');
    this.totalCount.set(Number(countResult[0]?.['count'] || 0));
    this.isTruncated.set(this.totalCount() > this.limit);
    this.loadedCount.set(Math.min(this.totalCount(), this.limit));

    // Perspective does not support GEOMETRY columns
    const geomColumns = await this.duckDbService.getGeometryColumns('data');
    const excludeStatement = geomColumns.length > 0 ? ` EXCLUDE (${geomColumns.join(', ')})` : '';
    const result = await this.duckDbService.runQuery(
      `SELECT *${excludeStatement} FROM data LIMIT ${this.limit}`,
    );

    if (!Array.isArray(result)) {
      throw new Error('Unexpected result format from DuckDbService');
    }

    this.table = (
      this.worker as { table: (data: unknown, opts: { name: string }) => unknown }
    ).table(this.sanitizeData(result), { name: this.tableName });
    await this.perspectiveWorkspace.nativeElement.addViewer({
      table: this.tableName,
      settings: true,
      theme: 'GeoNetwork',
    });
    await this.perspectiveWorkspace.nativeElement.flush?.();
  }

  async ngOnDestroy() {
    await this.clearPreviousDataIfAny();
  }

  loadVisualisation(layer: string) {
    this.perspectiveWorkspace.nativeElement.restore(this.visualisation[layer]);
  }

  async exportWorkspace() {
    const workspaceState = await this.perspectiveWorkspace.nativeElement.workspace.save();
    const blob = new Blob([JSON.stringify(workspaceState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perspective_workspace.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  restoreWorkspace(event: FileSelectEvent) {
    const file = event.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const workspaceState = JSON.parse(reader.result as string);
          this.perspectiveWorkspace.nativeElement.restore(workspaceState);
        } catch (e) {
          console.error('Failed to restore workspace:', e);
        }
      };
      reader.readAsText(file);
    }
  }
}
