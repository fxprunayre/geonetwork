import { Preset } from '@primeuix/themes/types';
import { elasticsearch } from 'gn-api-client';
import { DistributionConfig } from './gn4config';

export interface AppsConfiguration {
  apps: Apps;
  proxyUrl?: string;
  font?: string;
  theme?: Preset;
}

export interface Apps {
  menu?: Menu;
  i18n?: I18nApp;
  authentication?: AuthenticationApp;
  home?: HomeApp;
  search?: SearchApp;
  record?: RecordDetailsApp;
  map?: MapApp;
  banner?: BannerApp;
}

export interface App {
  enabled: boolean;
}

export interface BannerApp extends App {
  background?: string; // URL or CSS color
  title?: string;
  subTitle?: string;
  textColor?: string;
}

export interface Menu extends App {}

export interface I18nApp extends App {
  languages: {
    [iso3code: string]: string;
  };
  language: string;
  detection?: 'browser' | 'url' | 'html' | 'none';
}

export interface AuthenticationApp extends App {}

export interface HomeApp extends App {
  aggregations: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
}

export type SearchAppLayout = 'list' | 'grid' | 'table';

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

export interface MapApp extends App {
  context: any;
}

export interface RecordDetailsApp extends App {
  distribution?: DistributionConfig;
  mainThesaurus?: string[];
}
