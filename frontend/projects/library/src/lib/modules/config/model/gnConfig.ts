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
  detection?: I18nDetection;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AuthenticationApp extends App {}

export const I18N_DETECTION_OPTIONS = ['browser', 'url', 'html', 'none'] as const;
export type I18nDetection = (typeof I18N_DETECTION_OPTIONS)[number];

export const SHARING_MODE_OPTIONS = ['none', 'simple', 'byGroup', 'byWorkflow'] as const;
export type SharingMode = (typeof SHARING_MODE_OPTIONS)[number];

export interface SharingApp extends App {
  sharingMode: SharingMode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserSelectionsApp extends App {}

export interface HomeApp extends App {
  aggregations: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
}

export const SEARCH_LAYOUT_OPTIONS = ['list', 'grid', 'table'] as const;
export type SearchAppLayout = (typeof SEARCH_LAYOUT_OPTIONS)[number];

export const SEARCH_FILTER_POSITION_OPTIONS = [
  'drawer',
  'side',
  'side-fixed',
  'top',
  'none',
] as const;
export type SearchFilterPosition = (typeof SEARCH_FILTER_POSITION_OPTIONS)[number];

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
  filterPosition?: SearchFilterPosition;
}

export interface SearchAppAdvanced {
  score: string;
}

export const MAP_TYPE_OPTIONS = ['geolibre', 'sextant'] as const;
export type MapType = (typeof MAP_TYPE_OPTIONS)[number];

export const COVERAGE_SPATIAL_DISPLAY_TYPE_OPTIONS = ['image', 'dynamicMap'] as const;
export type CoverageSpatialDisplayType = (typeof COVERAGE_SPATIAL_DISPLAY_TYPE_OPTIONS)[number];

export interface GeoLibreEmbedConfiguration {
  embedUrl?: string;
  origin?: string;
  projectUrl?: string;
}

export interface SextantViewerConfiguration {
  context: MapContext;
  libUrl: string;
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
  coverageSpatialDisplayType?: CoverageSpatialDisplayType;
  showDiscussionTab?: boolean;
  showVersionWidgets?: boolean;
}
