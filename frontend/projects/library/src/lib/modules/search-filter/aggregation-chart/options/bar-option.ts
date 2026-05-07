import { AggregationBucketType } from '../../aggregation/aggregation.model';
import { BarVisibleRange, EChartsOption, ThemeColorFn } from './chart-option.types';

export function computeLowBarThreshold(
  buckets: AggregationBucketType[],
  visibleRange?: BarVisibleRange,
) {
  const rangeStart = Math.max(0, Math.min(visibleRange?.start ?? 0, buckets.length - 1));
  const rangeEnd = Math.max(
    rangeStart,
    Math.min(visibleRange?.end ?? buckets.length - 1, buckets.length - 1),
  );
  const visibleBuckets = buckets.slice(rangeStart, rangeEnd + 1);
  const visibleValues = visibleBuckets.map((b) => b.doc_count).sort((a, b) => a - b);
  const visibleMax = Math.max(...visibleValues, 0);
  const lowBarThresholdFromMax = visibleMax * 0.12;
  const p40Index = Math.floor((visibleValues.length - 1) * 0.4);
  const lowBarThresholdFromPercentile = visibleValues[Math.max(0, p40Index)] ?? 0;
  const lowBarThreshold = Math.min(lowBarThresholdFromMax, lowBarThresholdFromPercentile);

  return {
    lowBarThreshold,
    visibleMax,
    lowBarThresholdFromPercentile,
  };
}

export function buildBarSeriesData(
  buckets: AggregationBucketType[],
  activeSet: Set<string>,
  primaryColor: string,
  secondaryColor: string,
  visibleRange?: BarVisibleRange,
) {
  const { lowBarThreshold, visibleMax, lowBarThresholdFromPercentile } = computeLowBarThreshold(
    buckets,
    visibleRange,
  );

  return buckets.map((b) => {
    const isLowBar = b.doc_count <= lowBarThreshold;
    return {
      value: b.doc_count,
      key: b.key,
      label: {
        color: isLowBar ? '#0f172a' : '#ffffff',
        textBorderWidth: 1,
        textBorderColor: isLowBar ? '#ffffff' : 'transparent',
      },
      itemStyle: {
        color: activeSet.size === 0 || activeSet.has(String(b.key)) ? primaryColor : secondaryColor,
      },
    };
  });
}

export function buildBarOption(
  buckets: AggregationBucketType[],
  compactLabels: string[],
  activeSet: Set<string>,
  primaryColor: string,
  secondaryColor: string,
  visibleRange: BarVisibleRange | undefined,
  refreshPolicy: 'none' | undefined,
  isHistogram: boolean,
  themeColor: ThemeColorFn,
): EChartsOption {
  const handleColor = themeColor('--p-primary-300', '#3b82f6');
  const handleBorderColor = themeColor('--p-primary-500', '#1d4ed8');
  const fillerColor = themeColor('--p-primary-100', '#bfdbfe');
  const borderColor = themeColor('--p-surface-300', '#d1d5db');
  const bgColor = '#FFFFFF';
  const textColor = themeColor('--p-primary-500', '#6b7280');

  let sliderStartValue: number | undefined;
  let sliderEndValue: number | undefined;
  if (refreshPolicy === 'none' && activeSet.size > 0) {
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
    ...(isHistogram
      ? {
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
        }
      : {}),
    series: [
      {
        type: 'bar',
        itemStyle: { borderRadius: [0, 5, 5, 0] },
        label: {
          show: true,
          position: 'insideLeft',
          formatter: (params: any) => compactLabels[params.dataIndex] ?? '',
        },
        data: buildBarSeriesData(buckets, activeSet, primaryColor, secondaryColor, visibleRange),
      },
    ],
  };
}
