import { NgClass } from '@angular/common';
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
import { faSolidCompress, faSolidExpand, faSolidXmark } from '@ng-icons/font-awesome/solid';
import perspective from '@perspective-dev/client';
import { Button, ButtonIcon } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { Datasource, DuckDbService } from '../duck-db-service';

@Component({
  selector: 'app-perspective',
  imports: [Button, ButtonIcon, NgClass, NgIcon, ProgressBar],
  viewProviders: [
    provideIcons({
      faSolidExpand,
      faSolidCompress,
      faSolidXmark,
    }),
  ],
  template: `
    <div
      #viewerContainer
      class="transition-all duration-300"
      [ngClass]="{
        'fixed inset-0 z-100 h-screen w-screen bg-white p-4': isFullScreen(),
        'relative min-h-dvh h-full': !isFullScreen(),
      }"
    >
      <div
        class="flex flex-row items-center justify-items-end w-full gap-4"
        [ngClass]="{
          'float-right': isFullScreen(),
          'mt-2': !isFullScreen(),
        }"
      >
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
        </div>

        <p-button (click)="toggleFullScreen()">
          @if (isFullScreen()) {
            <ng-icon name="faSolidCompress" pButtonIcon />
          } @else {
            <ng-icon name="faSolidExpand" pButtonIcon />
          }
        </p-button>
      </div>
      <perspective-viewer #perspectiveViewer class="w-full min-h-dvh h-full" />
    </div>
  `,
  styleUrl: './perspective.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Perspective implements OnDestroy {
  datasource = input<Datasource | undefined>();

  @ViewChild('perspectiveViewer') perspectiveViewer!: ElementRef<any>;

  private duckDbService = inject(DuckDbService);
  private renderer = inject(Renderer2);

  progress = this.duckDbService.progress;
  isFullScreen = signal(false);
  error: string | undefined;

  private worker: any;

  constructor() {
    effect(async () => {
      const ds = this.datasource();
      if (ds) {
        this.initialize();

        await this.duckDbService.loadDatasource(ds);
        this.loadDataIntoPerspective();
      }
    });
  }

  cancel(): void {
    this.duckDbService.cancelDownload();
  }

  toggleFullScreen(): void {
    this.isFullScreen.update((v) => !v);
    // Trigger resize event after transition to allow perspective to redraw correctly
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
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

    // TODO: Count features and limit rows accordingly
    const limit = 100000;
    // Perspective does not support GEOMETRY columns
    const geomColumns = await this.duckDbService.getGeometryColumns('data');
    const excludeStatement = geomColumns.length > 0 ? ` EXCLUDE (${geomColumns.join(', ')})` : '';
    const result = await this.duckDbService.runQuery(
      `SELECT *${excludeStatement} FROM data LIMIT ${limit}`,
    );

    if (!Array.isArray(result)) {
      throw new Error('Unexpected result format from DuckDbService');
    }

    const table = this.worker.table(this.sanitizeData(result));
    this.perspectiveViewer.nativeElement.load(table);
    this.perspectiveViewer.nativeElement.restore();
  }

  ngOnDestroy() {
    this.perspectiveViewer?.nativeElement?.eject?.();
  }
}
