import { Preset } from '@primeuix/themes/types';
import { elasticsearch } from 'gn-api-client';
import type { MapLayerDisplayTarget } from '../../record';
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
  sharing?: SharingApp;
  userSelections?: UserSelectionsApp;
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Menu extends App {}

export interface I18nApp extends App {
  languages: Record<string, string>;
  language: string;
  detection?: 'browser' | 'url' | 'html' | 'none';
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuthenticationApp extends App {}

export type SharingMode = 'none' | 'simple' | 'byGroup' | 'byWorkflow';

export interface SharingApp extends App {
  sharingMode: SharingMode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserSelectionsApp extends App {}

export interface HomeApp extends App {
  aggregations: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
}

export type SearchAppLayout = 'list' | 'grid' | 'table';

export type SearchFunctionScoreFunction = Omit<
  elasticsearch.QueryDslFunctionScoreContainer,
  'filter'
> & {
  // Some valid Elasticsearch DSL filters (eg. exists) are missing in generated API types.
  filter?: elasticsearch.QueryDslQueryContainer | Record<string, unknown>;
};

export type SearchFunctionScoreConfig = Omit<
  elasticsearch.QueryDslFunctionScoreQuery,
  'query' | 'functions'
> & {
  functions?: SearchFunctionScoreFunction[];
};

export interface SearchKnnConfig {
  field: string;
  query_vector?: string | number[];
  k: number;
  num_candidates: number;
  filter?: elasticsearch.QueryDslQueryContainer | Record<string, unknown>;
}

export interface SearchApp extends App {
  filter?: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[];
  aggregations: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  functionScore?: SearchFunctionScoreConfig;
  minScore?: number;
  knn?: SearchKnnConfig;
  advanced?: SearchAppAdvanced;
  sort?: string[];
  currentSort?: string;
  hitsPerPageOptions: number[];
  resultsLayoutOptions?: SearchAppLayout[];
  topTabAggregation?: string;
  filterPosition?: 'drawer' | 'side' | 'side-fixed' | 'top';
}

export interface SearchAppAdvanced {
  score: string;
}

export type MapType = 'geolibre' | 'sextant';

export interface GeoLibreEmbedConfiguration {
  embedUrl?: string;
  origin?: string;
  projectUrl?: string;
}

export interface SextantViewerConfiguration {
  context: MapContext;
}

export type MapContext = Record<string, unknown>;

export interface MapApp extends App {
  type: MapType;
  geolibre?: GeoLibreEmbedConfiguration;
  sextant?: SextantViewerConfiguration;
}

export interface RecordDetailsApp extends App {
  distribution?: DistributionConfig;
  mainThesaurus?: string[];
  mapLayerDisplayTarget?: MapLayerDisplayTarget;
  coverageSpatialDisplayType?: 'image' | 'dynamicMap';
  showDiscussionTab?: boolean;
  showVersionWidgets?: boolean;
}
