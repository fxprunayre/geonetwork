import { elasticsearch } from 'gn-api-client';
import { DistributionConfig } from './gn4config';

export interface AppsConfiguration {
  apps: Apps;
}

export interface Apps {
  search?: SearchApp;
  record?: RecordDetailsApp;
  i18n?: I18nApp;
}

export interface App {
  enabled: boolean;
}

export interface I18nApp extends App {
  languages: {
    [iso3code: string]: string;
  };
  language: string;
  detection?: 'browser' | 'url' | 'html' | 'none';
}

export type SearchAppLayout = 'list' | 'grid';

export interface SearchApp extends App {
  topTabFilter?: string;
  filter?: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[];
  aggregations: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  advanced?: SearchAppAdvanced;
  sort?: string[];
  currentSort?: string;
  hitsPerPageOptions: number[];
  resultsLayoutOptions?: SearchAppLayout[];
}

export interface SearchAppAdvanced {
  score: string;
}

export interface RecordDetailsApp extends App {
  distribution?: DistributionConfig;
  mainThesaurus?: string[];
}
