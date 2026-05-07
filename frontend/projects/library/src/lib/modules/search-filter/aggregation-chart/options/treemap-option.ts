import { AggregationBucketType } from '../../aggregation/aggregation.model';
import { EChartsOption, ThemeColorFn, TruncateLabelFn } from './chart-option.types';

export function buildTreemapOption(
  buckets: AggregationBucketType[],
  labels: (string | number)[],
  activeSet: Set<string>,
  themeColor: ThemeColorFn,
  truncateLabel: TruncateLabelFn,
): EChartsOption {
  const palette = [
    themeColor('--p-primary-700', '#1d4ed8'),
    themeColor('--p-primary-600', '#2563eb'),
    themeColor('--p-primary-500', '#3b82f6'),
    themeColor('--p-primary-400', '#60a5fa'),
    themeColor('--p-primary-300', '#93c5fd'),
    themeColor('--p-primary-200', '#bfdbfe'),
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
          formatter: (params: any) => truncateLabel(params.name, 18),
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
