import {
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  input,
  OnDestroy,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { BarChart, PieChart, TreemapChart } from 'echarts/charts';
import type { TooltipComponentOption } from 'echarts/components';
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { AggregationChartLayout, Decorator } from 'gn-api-client';
import { ButtonModule } from 'primeng/button';
import { SearchBase } from '../../search/search-base/search-base';
import { AggregationBucketDecorator } from '../aggregation-bucket-decorator/aggregation-bucket-decorator';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationBucketType } from '../aggregation/aggregation.model';
import { buildBarOption, buildBarSeriesData } from './options/bar-option';
import { EChartsOption, type BarVisibleRange } from './options/chart-option.types';
import { buildNightingaleOption } from './options/nightingale-option';
import { buildPieOption } from './options/pie-option';
import { buildTreemapOption } from './options/treemap-option';

echarts.use([
  BarChart,
  PieChart,
  TreemapChart,
  DataZoomComponent,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-aggregation-chart',
  standalone: true,
  imports: [AggregationBucketDecorator, ButtonModule, TranslatePipe, NgIcon],
  providers: [AggregationTranslatePipe],
  viewProviders: [provideIcons({ faSolidXmark })],
  template: `
    <div class="flex h-full w-full flex-col overflow-hidden">
      @if (showRangeResetButton()) {
        <div class="z-20 flex justify-end pb-1">
          <button
            class="p-button p-button-secondary p-button-outlined"
            (click)="resetHistogramRange()"
            [title]="'search.aggregations.resetRange' | translate"
          >
            <ng-icon name="faSolidXmark" />
          </button>
        </div>
      }
      <div class="relative min-h-0 flex-1 overflow-hidden">
        @if (showSurfaceBackground() && backgroundImage()) {
          <div
            class="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-20"
            [style.background-image]="'url(' + backgroundImage() + ')'"
          ></div>
        }
        @if (showSurfaceBackground() && showBackgroundIcon()) {
          <div
            class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-15 text-[8rem]"
          >
            <app-aggregation-bucket-decorator
              [bucket]="backgroundBucket()"
              [decorator]="decorator()"
            />
          </div>
        }
        <div class="absolute inset-0 z-10" #chartContainer></div>
      </div>
    </div>
  `,
  host: { '[style.height]': 'hostHeight()' },
})
export class AggregationChart extends SearchBase implements OnDestroy {
  buckets = input.required<AggregationBucketType[]>();
  activeKeys = input<string[]>([]);
  layout = input.required<AggregationChartLayout>();
  keyName = input.required<string>();
  decorator = input<Decorator | undefined>();
  refreshPolicy = input<'none' | undefined>();
  isHistogram = input<boolean>(false);

  @Output() bucketClicked = new EventEmitter<string>();
  @Output() rangeSelected = new EventEmitter<string[]>();

  /** Height grows with content for bar and treemap layouts; pie/nightingale keep a fixed footprint. */
  hostHeight = computed(() => {
    if (this.layout() === 'bar') {
      const px = Math.min(Math.max(this.buckets().length * 28, 224), 780);
      return `${px}px`;
    }

    if (this.layout() === 'treemap') {
      const px = Math.min(Math.max(this.buckets().length * 40, 324), 640);
      return `${px}px`;
    }

    const px = 424;
    return `${px}px`;
  });

  showSurfaceBackground = computed(() => this.layout() !== 'bar');

  backgroundBucket = computed<{ key: string | number; doc_count: number }>(() => {
    const buckets = this.buckets();
    const defaultBucket = buckets[0] ?? { key: '', doc_count: 0 };
    const activeKey = this.activeKeys()[0];

    if (!activeKey) {
      return defaultBucket;
    }

    const matchingBucket = buckets.find((b) => String(b.key) === activeKey);
    return matchingBucket ?? defaultBucket;
  });

  backgroundImage = computed(() => {
    const decorator = this.decorator();
    if (!decorator || decorator.type !== 'img' || !decorator.map) {
      return '';
    }

    const key = String(this.backgroundBucket().key);
    return decorator.map[key] || '';
  });

  showBackgroundIcon = computed(() => {
    const decorator = this.decorator();
    return decorator?.type === 'icon' && !!this.backgroundBucket().key;
  });

  private translatePipe = inject(AggregationTranslatePipe);
  chartContainer = viewChild<ElementRef<HTMLElement>>('chartContainer');

  private chartInstance: ReturnType<typeof echarts.init> | null = null;
  private chartResizeObserver: ResizeObserver | null = null;
  private observedElement: HTMLElement | null = null;
  private dataZoomDebounce: ReturnType<typeof setTimeout> | null = null;
  private currentBarZoomRange: BarVisibleRange | undefined;
  private isBarRangeFiltered = signal(false);

  showRangeResetButton = computed(() => {
    return (
      this.layout() === 'bar' &&
      this.isHistogram() &&
      (this.activeKeys().length > 0 || this.isBarRangeFiltered())
    );
  });

  constructor() {
    super();
    effect(() => {
      this.buckets();
      this.activeKeys();
      this.layout();
      this.keyName();
      this.decorator();
      this.backgroundImage();
      this.showBackgroundIcon();
      this.showSurfaceBackground();
      this.observeContainer();
      requestAnimationFrame(() => this.renderChart());
    });
  }

  ngOnDestroy(): void {
    this.disconnectObserver();
    this.dispose();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.chartInstance?.resize();
  }

  private renderChart() {
    const container = this.chartContainer()?.nativeElement;
    if (!container) return;

    if (container.clientWidth === 0 || container.clientHeight === 0) {
      this.observeContainer();
      return;
    }

    const allBuckets = this.buckets();
    if (allBuckets.length === 0) {
      this.dispose();
      return;
    }

    if (!this.chartInstance) {
      this.chartInstance = echarts.init(container);
    }

    const activeSet = new Set(this.activeKeys());
    const keys = allBuckets.map((b) => b.key);
    const labels = allBuckets.map(
      (b) => b.displayLabel ?? this.translatePipe.transform(b.key, this.keyName()),
    );
    const compactLabels = labels.map((l) => this.truncateLabel(String(l), 42));

    const primaryColor = this.themeColor('--p-primary-500', '#2563eb');
    const secondaryColor = this.themeColor('--p-primary-300', '#93c5fd');
    const visibleBarRange =
      this.layout() === 'bar' ? this.getCurrentBarZoomRange(allBuckets.length) : undefined;

    const baseOption: EChartsOption =
      this.layout() === 'pie'
        ? buildPieOption(
            allBuckets,
            labels,
            activeSet,
            primaryColor,
            secondaryColor,
            this.themeColor,
            this.truncateLabel,
          )
        : this.layout() === 'nightingale'
          ? buildNightingaleOption(
              allBuckets,
              labels,
              activeSet,
              primaryColor,
              secondaryColor,
              this.themeColor,
              this.truncateLabel,
            )
          : this.layout() === 'treemap'
            ? buildTreemapOption(allBuckets, labels, activeSet, this.themeColor, this.truncateLabel)
            : buildBarOption(
                allBuckets,
                compactLabels,
                activeSet,
                primaryColor,
                secondaryColor,
                visibleBarRange,
                this.refreshPolicy(),
                this.isHistogram(),
                this.themeColor,
              );

    const option = this.applyAppFont(baseOption);

    this.chartInstance.setOption(option, true);
    if (this.layout() === 'bar' && this.isHistogram()) {
      this.currentBarZoomRange = this.getCurrentBarZoomRange(allBuckets.length);
      this.updateRangeResetButtonState(allBuckets.length);
    } else {
      this.isBarRangeFiltered.set(false);
    }
    this.chartInstance.off('click');
    this.chartInstance.on('click', (params: any) => {
      const key = params?.data?.key ?? keys[params?.dataIndex ?? -1];
      if (key != null) {
        this.bucketClicked.emit(String(key));
      }
    });
    this.chartInstance.off('datazoom');
    if (this.layout() === 'bar' && this.isHistogram()) {
      this.chartInstance.on('datazoom', (params: any) => {
        const eventRange = this.getBarZoomRangeFromEvent(params, allBuckets.length);
        if (eventRange) {
          this.currentBarZoomRange = eventRange;
          this.updateRangeResetButtonState(allBuckets.length);
        }
        this.updateBarLabelContrastForVisibleRange(
          allBuckets,
          compactLabels,
          activeSet,
          primaryColor,
          secondaryColor,
          this.currentBarZoomRange,
        );
        if (this.dataZoomDebounce !== null) clearTimeout(this.dataZoomDebounce);
        this.dataZoomDebounce = setTimeout(() => {
          this.emitZoomRange(allBuckets);
        }, 400);
      });
    }
  }

  private emitZoomRange(buckets: AggregationBucketType[]) {
    if (!this.chartInstance) return;
    const range = this.currentBarZoomRange ?? this.getCurrentBarZoomRange(buckets.length);
    if (!range) return;
    const lo = range.start;
    const hi = range.end;

    // Full-range zoom means "no range filter".
    if (lo <= 0 && hi >= buckets.length - 1) {
      this.rangeSelected.emit([]);
      return;
    }

    const keys = buckets.slice(Math.min(lo, hi), Math.max(lo, hi) + 1).map((b) => String(b.key));
    if (keys.length > 0) {
      this.rangeSelected.emit(keys);
    }
  }

  resetHistogramRange() {
    if (!this.chartInstance) return;

    this.chartInstance.dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100,
    });
    this.rangeSelected.emit([]);
    this.isBarRangeFiltered.set(false);
  }

  private getCurrentBarZoomRange(bucketCount: number): BarVisibleRange | undefined {
    if (!this.chartInstance || bucketCount <= 0) return undefined;
    const opt = this.chartInstance.getOption() as any;
    const dz = opt?.dataZoom?.[0];
    if (!dz) return undefined;

    return this.normalizeBarZoomRange(dz, bucketCount);
  }

  private getBarZoomRangeFromEvent(params: any, bucketCount: number): BarVisibleRange | undefined {
    if (bucketCount <= 0 || !params) return undefined;
    const payload = params?.batch?.[0] ?? params;
    return this.normalizeBarZoomRange(payload, bucketCount);
  }

  private normalizeBarZoomRange(source: any, bucketCount: number): BarVisibleRange | undefined {
    if (!source) return undefined;

    const startFromPercent = ((source.start ?? 0) / 100) * (bucketCount - 1);
    const endFromPercent = ((source.end ?? 100) / 100) * (bucketCount - 1);
    const rawStart = source.startValue ?? startFromPercent;
    const rawEnd = source.endValue ?? endFromPercent;
    const minRaw = Math.min(rawStart, rawEnd);
    const maxRaw = Math.max(rawStart, rawEnd);
    const start = Math.max(0, Math.min(bucketCount - 1, Math.floor(minRaw)));
    const end = Math.max(0, Math.min(bucketCount - 1, Math.ceil(maxRaw)));
    return { start, end };
  }

  private updateRangeResetButtonState(bucketCount: number) {
    if (!this.currentBarZoomRange || bucketCount <= 0) {
      this.isBarRangeFiltered.set(false);
      return;
    }

    const range = this.currentBarZoomRange;
    this.isBarRangeFiltered.set(!(range.start <= 0 && range.end >= bucketCount - 1));
  }

  private updateBarLabelContrastForVisibleRange(
    buckets: AggregationBucketType[],
    compactLabels: string[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
    visibleRange?: BarVisibleRange,
  ) {
    if (!this.chartInstance) return;

    const resolvedVisibleRange =
      visibleRange ?? this.currentBarZoomRange ?? this.getCurrentBarZoomRange(buckets.length);
    const data = buildBarSeriesData(
      buckets,
      activeSet,
      primaryColor,
      secondaryColor,
      resolvedVisibleRange,
    );

    this.chartInstance.setOption(
      {
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'insideLeft',
              formatter: (params: any) => compactLabels[params.dataIndex] ?? '',
            },
            data,
          },
        ],
      } as any,
      { notMerge: false, replaceMerge: ['series'] } as any,
    );
  }

  private applyAppFont(option: EChartsOption): EChartsOption {
    const fontFamily = this.themeColor('--app-font-family-sans', "'Inter', sans-serif");
    const tooltip = option.tooltip as TooltipComponentOption | undefined;

    return {
      ...option,
      textStyle: {
        ...(option['textStyle'] || {}),
        fontFamily,
      },
      tooltip: tooltip
        ? {
            ...tooltip,
            textStyle: {
              ...(tooltip['textStyle'] || {}),
              fontFamily,
            },
          }
        : tooltip,
    };
  }

  private dispose() {
    if (this.dataZoomDebounce !== null) {
      clearTimeout(this.dataZoomDebounce);
      this.dataZoomDebounce = null;
    }
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  }

  private observeContainer() {
    const container = this.chartContainer()?.nativeElement;
    if (!container || typeof ResizeObserver === 'undefined') return;

    if (!this.chartResizeObserver) {
      this.chartResizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          this.renderChart();
          this.chartInstance?.resize();
        });
      });
    }

    if (this.observedElement !== container) {
      if (this.observedElement) {
        this.chartResizeObserver.disconnect();
      }
      this.chartResizeObserver.observe(container);
      this.observedElement = container;
    }
  }

  private disconnectObserver() {
    if (this.chartResizeObserver) {
      this.chartResizeObserver.disconnect();
      this.chartResizeObserver = null;
      this.observedElement = null;
    }
  }

  private truncateLabel(label: string, maxLength: number): string {
    return label.length <= maxLength ? label : `${label.slice(0, maxLength - 1)}…`;
  }

  private themeColor(variable: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
  }
}
