export type AggregationBucketType = {
  key: string | number;
  label: string;
  displayLabel?: string;
  doc_count: number;
};
