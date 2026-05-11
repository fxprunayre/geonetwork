import { AggregationBucketType } from '../../aggregation/aggregation.model';
import { EChartsOption, ThemeColorFn, TruncateLabelFn } from './chart-option.types';
import { buildPieOption } from './pie-option';

export function buildNightingaleOption(
  buckets: AggregationBucketType[],
  labels: (string | number)[],
  activeSet: Set<string>,
  primaryColor: string,
  secondaryColor: string,
  themeColor: ThemeColorFn,
  truncateLabel: TruncateLabelFn,
): EChartsOption {
  const base = buildPieOption(
    buckets,
    labels,
    activeSet,
    primaryColor,
    secondaryColor,
    themeColor,
    truncateLabel,
  );
  const series = (base.series as any[])[0];
  series.roseType = 'area';
  series.radius = ['10%', '70%'];
  series.itemStyle = {
    borderRadius: 5,
  };
  return base;
}
