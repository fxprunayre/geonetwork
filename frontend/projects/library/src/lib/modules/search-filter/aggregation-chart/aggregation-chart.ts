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
  viewChild,
} from '@angular/core';
import type { BarSeriesOption, PieSeriesOption, TreemapSeriesOption } from 'echarts/charts';
import { BarChart, PieChart, TreemapChart } from 'echarts/charts';
import type {
  DataZoomComponentOption,
  GridComponentOption,
  TooltipComponentOption,
} from 'echarts/components';
import { DataZoomComponent, GridComponent, TooltipComponent } from 'echarts/components';
import type { ComposeOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { AggregationChartLayout, Decorator } from 'gn-api-client';
import { AggregationBucketDecorator } from '../aggregation-bucket-decorator/aggregation-bucket-decorator';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationBucketType } from '../aggregation/aggregation.model';

echarts.use([
  BarChart,
  PieChart,
  TreemapChart,
  DataZoomComponent,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
]);

type EChartsOption = ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | TreemapSeriesOption
  | DataZoomComponentOption
  | GridComponentOption
  | TooltipComponentOption
>;

@Component({
  selector: 'app-aggregation-chart',
  standalone: true,
  imports: [AggregationBucketDecorator],
  providers: [AggregationTranslatePipe],
  template: `
    <div class="relative h-full w-full overflow-hidden">
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
  `,
  host: { '[style.height]': 'hostHeight()' },
})
export class AggregationChart implements OnDestroy {
  buckets = input.required<AggregationBucketType[]>();
  activeKeys = input<string[]>([]);
  layout = input.required<AggregationChartLayout>();
  keyName = input.required<string>();
  decorator = input<Decorator | undefined>();
  refreshPolicy = input<'none' | undefined>();

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

  constructor() {
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
        ? this.buildPieOption(allBuckets, labels, activeSet, primaryColor, secondaryColor)
        : this.layout() === 'nightingale'
          ? this.buildNightingaleOption(allBuckets, labels, activeSet, primaryColor, secondaryColor)
          : this.layout() === 'treemap'
            ? this.buildTreemapOption(allBuckets, labels, activeSet, primaryColor, secondaryColor)
            : this.buildBarOption(
                allBuckets,
                compactLabels,
                activeSet,
                primaryColor,
                secondaryColor,
                visibleBarRange,
              );

    const option = this.applyAppFont(baseOption);

    this.chartInstance.setOption(option, true);
    this.chartInstance.off('click');
    this.chartInstance.on('click', (params: any) => {
      const key = params?.data?.key ?? keys[params?.dataIndex ?? -1];
      if (key != null) {
        this.bucketClicked.emit(String(key));
      }
    });
    this.chartInstance.off('datazoom');
    if (this.layout() === 'bar') {
      this.chartInstance.on('datazoom', () => {
        this.updateBarLabelContrastForVisibleRange(
          allBuckets,
          compactLabels,
          activeSet,
          primaryColor,
          secondaryColor,
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
    const opt = this.chartInstance.getOption() as any;
    const dz = opt?.dataZoom?.[0];
    if (!dz) return;
    const lo = Math.round(dz.startValue ?? 0);
    const hi = Math.round(dz.endValue ?? buckets.length - 1);
    const keys = buckets.slice(Math.min(lo, hi), Math.max(lo, hi) + 1).map((b) => String(b.key));
    if (keys.length > 0) {
      this.rangeSelected.emit(keys);
    }
  }

  private getCurrentBarZoomRange(bucketCount: number): { start: number; end: number } | undefined {
    if (!this.chartInstance || bucketCount <= 0) return undefined;
    const opt = this.chartInstance.getOption() as any;
    const dz = opt?.dataZoom?.[0];
    if (!dz) return undefined;

    const start = Math.max(0, Math.min(bucketCount - 1, Math.round(dz.startValue ?? 0)));
    const end = Math.max(0, Math.min(bucketCount - 1, Math.round(dz.endValue ?? bucketCount - 1)));
    return { start, end };
  }

  private updateBarLabelContrastForVisibleRange(
    buckets: AggregationBucketType[],
    compactLabels: string[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
  ) {
    if (!this.chartInstance) return;

    const visibleRange = this.getCurrentBarZoomRange(buckets.length);
    const data = this.buildBarSeriesData(
      buckets,
      activeSet,
      primaryColor,
      secondaryColor,
      visibleRange,
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
      false,
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

  private buildTreemapOption(
    buckets: AggregationBucketType[],
    labels: (string | number)[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
  ): EChartsOption {
    const palette = [
      this.themeColor('--p-primary-700', '#1d4ed8'),
      this.themeColor('--p-primary-600', '#2563eb'),
      this.themeColor('--p-primary-500', '#3b82f6'),
      this.themeColor('--p-primary-400', '#60a5fa'),
      this.themeColor('--p-primary-300', '#93c5fd'),
      this.themeColor('--p-primary-200', '#bfdbfe'),
    ];

    return {
      tooltip: { trigger: 'item', extraCssText: 'z-index: 9999;' },
      series: [
        {
          type: 'treemap',
          width: '100%',
          height: '100%',
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: (params: any) => this.truncateLabel(params.name, 18),
            fontSize: 11,
            color: '#fff',
            overflow: 'truncate',
          },
          data: buckets.map((b, i) => ({
            value: b.doc_count,
            name: String(labels[i]),
            key: b.key,
            itemStyle: {
              color: palette[i % palette.length],
              opacity: activeSet.size === 0 || activeSet.has(String(b.key)) ? 1 : 0.3,
            },
          })),
        },
      ],
    };
  }

  private buildNightingaleOption(
    buckets: AggregationBucketType[],
    labels: (string | number)[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
  ): EChartsOption {
    const base = this.buildPieOption(buckets, labels, activeSet, primaryColor, secondaryColor);
    const series = (base.series as any[])[0];
    series.roseType = 'area';
    series.radius = ['10%', '70%'];
    series.itemStyle = {
      borderRadius: 5,
    };
    return base;
  }

  private buildPieOption(
    buckets: AggregationBucketType[],
    labels: (string | number)[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
  ): EChartsOption {
    return {
      tooltip: { trigger: 'item', extraCssText: 'z-index: 9999;' },
      color: [
        primaryColor,
        secondaryColor,
        this.themeColor('--p-primary-700', '#1d4ed8'),
        this.themeColor('--p-primary-100', '#dbeafe'),
      ],
      series: [
        {
          type: 'pie',
          radius: ['30%', '55%'],
          center: ['50%', '50%'],
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => this.truncateLabel(params.name, 20),
            fontSize: 11,
            overflow: 'truncate',
          },
          labelLine: {
            show: true,
            length: 8,
            length2: 12,
            smooth: true,
          },
          data: buckets.map((b, i) => ({
            value: b.doc_count,
            name: String(labels[i]),
            key: b.key,
            itemStyle: {
              opacity: activeSet.size === 0 || activeSet.has(String(b.key)) ? 1 : 0.35,
            },
          })),
        },
      ],
    };
  }

  private buildBarOption(
    buckets: AggregationBucketType[],
    compactLabels: string[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
    visibleRange?: { start: number; end: number },
  ): EChartsOption {
    const handleColor = this.themeColor('--p-primary-300', '#3b82f6');
    const handleBorderColor = this.themeColor('--p-primary-500', '#1d4ed8');
    const fillerColor = this.themeColor('--p-primary-100', '#bfdbfe');
    const borderColor = this.themeColor('--p-surface-300', '#d1d5db');
    const bgColor = '#FFFFFF';
    const textColor = this.themeColor('--p-primary-500', '#6b7280');

    // When refreshPolicy is 'none', buckets don't change after filtering,
    // so we drive the slider position from the active selection.
    let sliderStartValue: number | undefined;
    let sliderEndValue: number | undefined;
    if (this.refreshPolicy() === 'none' && activeSet.size > 0) {
      const activeIndices = buckets
        .map((b, i) => (activeSet.has(String(b.key)) ? i : -1))
        .filter((i) => i >= 0);
      if (activeIndices.length > 0) {
        sliderStartValue = Math.min(...activeIndices);
        sliderEndValue = Math.max(...activeIndices);
      }
    }

    return {
      tooltip: { trigger: 'item' },
      grid: { left: 8, right: 8, top: 20, bottom: 50, containLabel: false },
      xAxis: { type: 'value', splitLine: { show: false } },
      yAxis: {
        type: 'category',
        data: compactLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      dataZoom: [
        {
          type: 'slider',
          show: buckets.length > 5,
          yAxisIndex: 0,
          ...(sliderStartValue !== undefined ? { startValue: sliderStartValue } : {}),
          ...(sliderEndValue !== undefined ? { endValue: sliderEndValue } : {}),
          textStyle: { color: textColor },
          borderColor,
          backgroundColor: bgColor,
          handleStyle: { color: handleColor, borderColor: handleBorderColor },
          moveHandleStyle: { color: handleColor, opacity: 0.6 },
          fillerColor: fillerColor + '55',
          emphasis: {
            handleLabel: { show: false },
            handleStyle: { color: handleBorderColor, borderColor: handleBorderColor },
            moveHandleStyle: { color: handleBorderColor },
          },
        },
      ],
      series: [
        {
          type: 'bar',
          itemStyle: { borderRadius: [0, 5, 5, 0] },
          label: {
            show: true,
            position: 'insideLeft',
            formatter: (params: any) => compactLabels[params.dataIndex] ?? '',
          },
          data: this.buildBarSeriesData(
            buckets,
            activeSet,
            primaryColor,
            secondaryColor,
            visibleRange,
          ),
        },
      ],
    };
  }

  private buildBarSeriesData(
    buckets: AggregationBucketType[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
    visibleRange?: { start: number; end: number },
  ) {
    const rangeStart = Math.max(0, Math.min(visibleRange?.start ?? 0, buckets.length - 1));
    const rangeEnd = Math.max(
      rangeStart,
      Math.min(visibleRange?.end ?? buckets.length - 1, buckets.length - 1),
    );
    const visibleBuckets = buckets.slice(rangeStart, rangeEnd + 1);
    const visibleMax = Math.max(...visibleBuckets.map((b) => b.doc_count), 0);
    const lowBarThreshold = visibleMax * 0.12;

    return buckets.map((b) => {
      const isLowBar = b.doc_count <= lowBarThreshold;
      return {
        value: b.doc_count,
        key: b.key,
        label: {
          color: isLowBar ? '#0f172a' : '#ffffff',
          textBorderWidth: 1,
          textBorderColor: isLowBar ? '#ffffff' : '',
        },
        itemStyle: {
          color:
            activeSet.size === 0 || activeSet.has(String(b.key)) ? primaryColor : secondaryColor,
        },
      };
    });
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
