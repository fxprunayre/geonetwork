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
import * as echarts from 'echarts';
import { AggregationChartLayout } from 'gn-api-client';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationBucketType } from '../aggregation/aggregation.model';

@Component({
  selector: 'app-aggregation-chart',
  standalone: true,
  providers: [AggregationTranslatePipe],
  template: `<div class="h-full w-full" #chartContainer></div>`,
  host: { '[style.height]': 'hostHeight()' },
})
export class AggregationChart implements OnDestroy {
  buckets = input.required<AggregationBucketType[]>();
  activeKeys = input<string[]>([]);
  layout = input.required<AggregationChartLayout>();
  keyName = input.required<string>();

  @Output() bucketClicked = new EventEmitter<string>();

  /** Height grows with the number of bars (28 px per bar, capped at 480 px, min 224 px). Pie/treemap are fixed. */
  hostHeight = computed(() => {
    if (this.layout() !== 'bar') return '224px';
    const px = Math.min(Math.max(this.buckets().length * 28, 224), 480);
    return `${px}px`;
  });

  private translatePipe = inject(AggregationTranslatePipe);
  chartContainer = viewChild<ElementRef<HTMLElement>>('chartContainer');

  private chartInstance: echarts.ECharts | null = null;
  private chartResizeObserver: ResizeObserver | null = null;
  private observedElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      this.buckets();
      this.activeKeys();
      this.layout();
      this.keyName();
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
    const compactLabels = labels.map((l) => this.truncateLabel(String(l), 22));

    const primaryColor = this.themeColor('--p-primary-500', '#2563eb');
    const secondaryColor = this.themeColor('--p-primary-300', '#93c5fd');

    const option: echarts.EChartsOption =
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
              );

    this.chartInstance.setOption(option, true);
    this.chartInstance.off('click');
    this.chartInstance.on('click', (params: any) => {
      const key = params?.data?.key ?? keys[params?.dataIndex ?? -1];
      if (key != null) {
        this.bucketClicked.emit(String(key));
      }
    });
  }

  private buildTreemapOption(
    buckets: AggregationBucketType[],
    labels: (string | number)[],
    activeSet: Set<string>,
    primaryColor: string,
    secondaryColor: string,
  ): echarts.EChartsOption {
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
            overflow: 'truncate',
          },
          data: buckets.map((b, i) => ({
            value: b.doc_count,
            name: String(labels[i]),
            key: b.key,
            itemStyle: {
              color:
                activeSet.size === 0 || activeSet.has(String(b.key))
                  ? primaryColor
                  : secondaryColor,
              opacity: activeSet.size === 0 || activeSet.has(String(b.key)) ? 1 : 0.4,
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
  ): echarts.EChartsOption {
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
  ): echarts.EChartsOption {
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
  ): echarts.EChartsOption {
    return {
      tooltip: { trigger: 'item' },
      grid: { left: 8, right: 8, top: 20, bottom: 8, containLabel: false },
      xAxis: { type: 'value', splitLine: { show: false } },
      yAxis: {
        type: 'category',
        data: compactLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      series: [
        {
          type: 'bar',
          itemStyle: { borderRadius: [0, 5, 5, 0] },
          label: {
            show: true,
            position: 'insideLeft',
            formatter: (params: any) => compactLabels[params.dataIndex] ?? '',
          },
          data: buckets.map((b) => ({
            value: b.doc_count,
            key: b.key,
            itemStyle: {
              color:
                activeSet.size === 0 || activeSet.has(String(b.key))
                  ? primaryColor
                  : secondaryColor,
            },
          })),
        },
      ],
    };
  }

  private dispose() {
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
