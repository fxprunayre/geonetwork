import { elasticsearch, IndexRecord } from 'gn-api-client';
import { SearchAppLayout } from '../config/model/gnConfig';

export const DEFAULT_PAGE_SIZE = 10;
export const TRACK_TOTAL_HITS = true;
export const DEFAULT_SORT = '_score';
export const DEFAULT_SORT_OPTIONS = [DEFAULT_SORT];
export const DEFAULT_AGGREGATION_SIZE = 10;

export interface SearchFilter {
  field: string;
  values: (string | number)[];
}

export interface SearchFilterChange {
  field: string;
  values: (string | number)[];
  add: boolean;
}

export interface SearchState {
  id: string;
  routing: boolean;
  searchQuery: string;
  // A general filter string that can be used to apply additional filtering
  filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[];
  results: IndexRecord[];
  sort: string[];
  currentSort: string;
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isAppendMode: boolean;
  layout: SearchAppLayout;
  language: string;
  hasError: boolean;
}

export interface SearchFilterParameters {
  searchQuery: string;
  filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[];
  filters?: Record<string, SearchFilter>;
  aggregationsConfig?: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  currentSort: string;
  language?: string;
}

export interface SearchRequestPageParameters {
  currentPage: number;
  pageSize: number;
}

export interface SearchRequestParameters
  extends SearchFilterParameters, SearchRequestPageParameters {
  layout: SearchAppLayout;
}

export type SearchStoreContract = Record<string, unknown>;

export type SearchRegistry<TStore extends SearchStoreContract = SearchStoreContract> = Record<
  string,
  TStore
>;
