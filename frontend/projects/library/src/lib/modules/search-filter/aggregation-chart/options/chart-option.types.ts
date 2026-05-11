import type { BarSeriesOption, PieSeriesOption, TreemapSeriesOption } from 'echarts/charts';
import type {
  DataZoomComponentOption,
  GridComponentOption,
  TooltipComponentOption,
} from 'echarts/components';
import type { ComposeOption } from 'echarts/core';

export type EChartsOption = ComposeOption<
  | BarSeriesOption
  | PieSeriesOption
  | TreemapSeriesOption
  | DataZoomComponentOption
  | GridComponentOption
  | TooltipComponentOption
>;

export type ThemeColorFn = (variable: string, fallback: string) => string;
export type TruncateLabelFn = (label: string, maxLength: number) => string;

export type BarVisibleRange = {
  start: number;
  end: number;
};
