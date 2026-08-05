import { AggregationBucketType } from '../../aggregation.model';
import { EChartsOption, ThemeColorFn, TruncateLabelFn } from './chart-option.types';

export function buildPieOption(
  buckets: AggregationBucketType[],
  labels: (string | number)[],
  activeSet: Set<string>,
  primaryColor: string,
  secondaryColor: string,
  themeColor: ThemeColorFn,
  truncateLabel: TruncateLabelFn,
): EChartsOption {
  return {
    tooltip: { trigger: 'item', extraCssText: 'z-index: 9999;' },
    color: [
      primaryColor,
      secondaryColor,
      themeColor('--p-primary-700', '#1d4ed8'),
      themeColor('--p-primary-100', '#dbeafe'),
    ],
    series: [
      {
        type: 'pie',
        radius: ['30%', '55%'],
        center: ['50%', '50%'],
        label: {
          show: true,
          position: 'outside',
          formatter: (params: { name: string }) => truncateLabel(params.name, 20),
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
