import { elasticsearch, IndexRecord } from 'gn-api-client';

export const DEFAULT_PAGE_SIZE = 10;
export const TRACK_TOTAL_HITS = true;
export const DEFAULT_SORT: elasticsearch.Sort = ['_score'];
export const DEFAULT_AGGREGATION_SIZE = 10;

export type SearchFilter = {
  field: string;
  values: (string | number)[];
};

export type SearchState = {
  id: string;
  routing: boolean;
  searchQuery: string;
  // A general filter string that can be used to apply additional filtering
  filter?: string;
  // Aggregation to display on top of the search results
  topFilter?: string;
  filters: Record<string, SearchFilter>;
  results: IndexRecord[];
  aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  aggregations: Record<string, elasticsearch.AggregationsAggregate>;
  sort: elasticsearch.Sort;
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

export interface SearchFilterParameters {
  searchQuery: string;
  filter?: string;
  filters: Record<string, SearchFilter>;
  aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  sort: elasticsearch.Sort;
}

export interface SearchRequestPageParameters {
  currentPage: number;
  pageSize: number;
}

export interface SearchRequestParameters
  extends SearchFilterParameters,
    SearchRequestPageParameters {}
