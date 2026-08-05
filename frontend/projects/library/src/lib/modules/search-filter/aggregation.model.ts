export interface AggregationBucketType {
  key: string | number;
  label: string;
  displayLabel?: string;
  doc_count: number;
}
