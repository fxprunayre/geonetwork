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
import perspective from '@perspective-dev/client';
import { Datasource, DuckDbService } from '../duck-db.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidExpand, faSolidCompress } from '@ng-icons/font-awesome/solid';
import { Button, ButtonIcon } from 'primeng/button';
import { NgClass } from '@angular/common';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-perspective',
  imports: [Button, NgIcon, ProgressBar, NgClass, ButtonIcon],
  viewProviders: [
    provideIcons({
      faSolidExpand,
      faSolidCompress,
    }),
  ],
  template: `
    @if (progress().status !== 'completed' && progress().status !== 'idle') {
      <p-progressbar [value]="progress().progress" class="my-4">
        <ng-template #content let-value>
          <span>{{ progress().status }}</span>
        </ng-template>
      </p-progressbar>
    }
    <div
      #viewerContainer
      class="transition-all duration-300"
      [ngClass]="{
        'fixed inset-0 z-[100] h-screen w-screen bg-white p-4': isFullScreen(),
        'relative min-h-dvh h-full': !isFullScreen(),
      }"
    >
      <p-button (click)="toggleFullScreen()" styleClass="float-right">
        @if (isFullScreen()) {
          <ng-icon name="faSolidCompress" pButtonIcon />
        } @else {
          <ng-icon name="faSolidExpand" pButtonIcon />
        }
      </p-button>
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
    this.perspectiveViewer.nativeElement.restore({ settings: true });
  }

  ngOnDestroy() {
    this.perspectiveViewer?.nativeElement?.eject?.();
  }
}
