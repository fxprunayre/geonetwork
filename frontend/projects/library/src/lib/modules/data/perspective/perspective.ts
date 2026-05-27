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
import perspective from '@perspective-dev/client';
import { Button, ButtonIcon } from 'primeng/button';
import { Message } from 'primeng/message';
import { Popover } from 'primeng/popover';
import { ProgressBar } from 'primeng/progressbar';
import { Datasource } from '../datasource.model';
import { DuckDbService } from '../duck-db-service';

@Component({
  selector: 'app-perspective',
  imports: [Button, ButtonIcon, Message, NgIcon, Popover, ProgressBar, TranslateModule],
  viewProviders: [
    provideIcons({
      faSolidXmark,
      faSolidTriangleExclamation,
    }),
  ],
  template: `
    <div #viewerContainer class="relative h-full min-h-0 overflow-hidden flex flex-col">
      <div class="flex flex-row items-center justify-items-end w-full gap-4 my-4">
        <div class="flex flex-row items-center gap-4 grow">
          @if (progress().status !== 'completed' && progress().status !== 'idle') {
            @let errorOrCancel = progress().status === 'error' || progress().status === 'canceled';
            <p-progressbar
              [mode]="errorOrCancel ? 'determinate' : 'indeterminate'"
              [style]="{ height: '6px' }"
              class="basis-1/3"
            />
            <div class="basis-2/3 flex items-center gap-2">
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

          @if (progress().status === 'completed' && isTruncated()) {
            <p-message
              [severity]="'warn'"
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
        </div>
      </div>
      <perspective-workspace #perspectiveWorkspace theme="GeoNetwork" class="w-full grow" />
    </div>
  `,
  styleUrl: './perspective.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Perspective implements OnDestroy {
  datasource = input<Datasource | undefined>();

  @ViewChild('perspectiveWorkspace') perspectiveWorkspace!: ElementRef<any>;

  private duckDbService = inject(DuckDbService);
  private renderer = inject(Renderer2);

  progress = this.duckDbService.progress;
  isTruncated = signal(false);
  totalCount = signal(0);
  loadedCount = signal(0);
  limit = 100000;
  error: string | undefined;

  private worker: any;
  private table: any;
  private workspaceLoaded = false;
  private readonly tableName = 'data';

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
    if (this.table?.delete) {
      await this.table.delete();
      this.table = undefined;
    }
    if (this.perspectiveWorkspace?.nativeElement?.clear) {
      await this.perspectiveWorkspace.nativeElement.clear();
    }
  }

  private async initialize(): Promise<any> {
    try {
      await Promise.all([
        this.duckDbService.init(),
        this.duckDbService.initializePerspective(this.renderer),
      ]);
    } catch (e: any) {
      this.error = e.message;
      console.error('Initialization failed:', e);
    }
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

  private async loadDataIntoPerspective() {
    this.worker = this.worker || (await perspective.worker());

    if (!this.workspaceLoaded && this.perspectiveWorkspace?.nativeElement?.load) {
      await this.perspectiveWorkspace.nativeElement.load(this.worker);
      this.workspaceLoaded = true;
    }

    const countResult = await this.duckDbService.runQuery('SELECT count(*) as count FROM data');
    this.totalCount.set(Number(countResult[0]?.count || 0));
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

    this.table = this.worker.table(this.sanitizeData(result), { name: this.tableName });
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
}
