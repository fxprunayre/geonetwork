import { elasticsearch, IndexRecord } from 'gn-api-client';

export const DEFAULT_PAGE_SIZE = 10;
export const TRACK_TOTAL_HITS = true;
export const DEFAULT_SORT = '_score';
export const DEFAULT_SORT_OPTIONS = [DEFAULT_SORT];
export const DEFAULT_AGGREGATION_SIZE = 10;

export type SearchFilter = {
  field: string;
  values: (string | number)[];
};

export type SearchFilterChange = {
  field: string;
  values: (string | number)[];
  add: boolean;
};

export type SearchState = {
  id: string;
  routing: boolean;
  searchQuery: string;
  // A general filter string that can be used to apply additional filtering
  filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[];
  // Aggregation to display on top of the search results
  topFilter?: string;
  filters: Record<string, SearchFilter>;
  results: IndexRecord[];
  aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  aggregations: Record<string, elasticsearch.AggregationsAggregate>;
  sort: string[];
  currentSort: string;
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isAppendMode: boolean;
};

export interface SearchFilterParameters {
  searchQuery: string;
  filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[];
  filters: Record<string, SearchFilter>;
  aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  currentSort: string;
}

export interface SearchRequestPageParameters {
  currentPage: number;
  pageSize: number;
}

export interface SearchRequestParameters
  extends SearchFilterParameters,
    SearchRequestPageParameters {}
