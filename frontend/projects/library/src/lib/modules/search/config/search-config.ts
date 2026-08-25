import { elasticsearch } from 'gn-api-client';
import { SearchApp, SearchAppLayout } from '../../config/model/gnConfig';
import { DEFAULT_RECORD_DOWNLOAD_PROTOCOLS, DEFAULT_RECORD_VIEW_PROTOCOLS } from '../../record';

export type AggregationItem =
  | string
  | Record<string, elasticsearch.AggregationsAggregationContainer>;

export interface WellKnownAggregationPreset {
  key: string;
  label: string;
  aggregation: AggregationItem;
}

export interface WellKnownAggregationGroup {
  key: string;
  label: string;
  presets: WellKnownAggregationPreset[];
}

export const RESOURCE_TYPE_AGGREGATION: elasticsearch.AggregationsAggregationContainer = {
  terms: {
    field: 'resourceType',
    size: 10,
    exclude: 'map/.*|publication-.*',
  },
  meta: {
    collapsed: false,
    layout: 'nightingale',
    decorator: {
      type: 'icon',
      map: {
        dataset: 'faSolidDatabase',
        map: 'faSolidMap',
        featureCatalog: 'faSolidTable',
        document: 'faSolidCopy',
        service: 'faSolidCloud',
        series: 'faSolidCopy',
        nonGeographicDataset: 'faSolidChartColumn',
        publication: 'faSolidBook',
      },
    },
  },
};

export const INSPIRE_AGGREGATION: elasticsearch.AggregationsAggregationContainer = {
  terms: {
    field: 'th_httpinspireeceuropaeutheme-theme_tree.key',
    size: 34,
    order: { _key: 'asc' },
  },
  meta: {
    collapsed: true,
    translateOnLoad: true,
    orderByTranslation: true,
    decorator: {
      type: 'icon',
      prefix: 'iti-',
      expression: 'http://inspire.ec.europa.eu/theme/(.*)',
    },
  },
};

export const WELL_KNOWN_AGGREGATION_GROUPS: WellKnownAggregationGroup[] = [
  {
    key: 'sharing',
    label: 'Sharing',
    presets: [
      {
        key: 'groupPublishedId',
        label: 'Group Published Id',
        aggregation: {
          groupPublishedId: {
            terms: {
              field: 'groupPublishedId',
              size: 300,
              include: '.*',
              exclude: '1',
            },
            meta: {
              field: 'groupPublishedId',
              orderByTranslation: true,
              filterByTranslation: true,
              displayFilter: true,
              collapsed: false,
              layout: 'multiselect',
            },
          },
        },
      },
    ],
  },
  {
    key: 'themes',
    label: 'Themes',
    presets: [
      {
        key: 'th_sextant-theme_tree.key',
        label: 'Sextant Theme',
        aggregation: {
          'th_sextant-theme_tree.key': {
            terms: {
              field: 'th_sextant-theme_tree.key',
              size: 300,
              order: { _key: 'asc' },
            },
            meta: {
              collapsed: false,
              orderByTranslation: true,
              translateOnLoad: true,
              layout: 'tree',
              refreshPolicy: 'none',
            },
          },
        },
      },
      {
        key: 'th_httpinspireeceuropaeutheme-theme_tree.key',
        label: 'Inspire Theme',
        aggregation: {
          'th_httpinspireeceuropaeutheme-theme_tree.key': INSPIRE_AGGREGATION,
        },
      },
    ],
  },
  {
    key: 'statistics',
    label: 'Statistics',
    presets: [
      {
        key: 'creationYearForResource',
        label: 'Creation Year',
        aggregation: {
          creationYearForResource: {
            terms: {
              field: 'creationYearForResource',
              size: 10,
              order: {
                _key: 'desc',
              },
            },
            meta: {
              collapsed: false,
              // layout: 'multiselect',
            },
          },
        },
      },
    ],
  },
  {
    key: 'organization',
    label: 'Organization',
    presets: [
      {
        key: 'OrgForResource',
        label: 'Organization',
        aggregation: {
          OrgForResource: {
            terms: {
              field: 'OrgForResourceObject.default',
              include: '.*',
              size: 10,
            },
            meta: {
              collapsed: true,
              // Always display filter even no more elements
              // This can be used when all facet values are loaded
              // with a large size and you want to provide filtering.
              // displayFilter: true,
              caseInsensitiveInclude: true,
            },
          },
        },
      },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    presets: [
      {
        key: 'availableInServices',
        label: 'Available In Services',
        aggregation: {
          availableInServices: {
            filters: {
              //"other_bucket_key": "others",
              // But does not support to click on it
              filters: {
                availableInViewService: {
                  query_string: {
                    query: '+linkProtocol:/' + DEFAULT_RECORD_VIEW_PROTOCOLS.join('|') + '/',
                  },
                },
                availableInDownloadService: {
                  query_string: {
                    query: '+linkProtocol:/' + DEFAULT_RECORD_DOWNLOAD_PROTOCOLS.join('|') + '/',
                  },
                },
              },
            },
            meta: {
              collapsed: true,
              decorator: {
                type: 'icon',
                map: {
                  availableInViewService: 'faSolidMap',
                  availableInDownloadService: 'faSolidCloudArrowDown',
                },
              },
            },
          },
        },
      },
    ],
  },
  {
    key: 'resourceType',
    label: 'Resource Type',
    presets: [
      {
        key: 'resourceType',
        label: 'Resource Type',
        aggregation: {
          resourceType: RESOURCE_TYPE_AGGREGATION,
        },
      },
    ],
  },
];

export const WELL_KNOWN_AGGREGATIONS: WellKnownAggregationPreset[] =
  WELL_KNOWN_AGGREGATION_GROUPS.flatMap((group) => group.presets);

function cloneAggregationItem(item: AggregationItem): AggregationItem {
  if (typeof structuredClone === 'function') {
    return structuredClone(item);
  }
  return JSON.parse(JSON.stringify(item)) as AggregationItem;
}

export const DEFAULT_SEARCH_APP_AGGREGATIONS: AggregationItem[] = WELL_KNOWN_AGGREGATIONS.map(
  (item) => cloneAggregationItem(item.aggregation),
);

export const DEFAULT_SEARCH_APP_SORTOPTIONS = [
  '-popularity',
  '_score',
  '-resourceDate',
  'resourceTitleObject.default.sort',
];

export const DEFAULT_SEARCH_LAYOUT_OPTIONS: SearchAppLayout[] = ['list', 'grid'];

export const DEFAULT_SEARCH_APP_HITS_PER_PAGE_OPTIONS = [20, 100];

export const DEFAULT_SEARCH_APP_CONFIGURATION: SearchApp = {
  enabled: true,
  aggregations: DEFAULT_SEARCH_APP_AGGREGATIONS,
  functionScore: {
    score_mode: 'sum',
    boost_mode: 'sum',
    functions: [
      // {
      //   filter: { term: { resourceType: 'series' } },
      //   weight: 1.1,
      // },
      {
        filter: { exists: { field: 'parentUuid' } },
        weight: 0.3,
      },
      {
        filter: { match: { 'cl_status.key': 'obsolete' } },
        weight: 0.2,
      },
      {
        filter: { match: { 'cl_status.key': 'superseded' } },
        weight: 0.3,
      },
      {
        field_value_factor: {
          field: 'popularity',
          modifier: 'log1p',
          factor: 0.1,
          missing: 0,
        },
      },
      {
        gauss: {
          publicationDateForResource: {
            origin: 'now',
            scale: '365d',
            offset: '30d',
            decay: 0.5,
          },
        },
        weight: 1.5,
      },
      {
        gauss: {
          revisionDateForResource: {
            origin: 'now',
            scale: '365d',
            offset: '30d',
            decay: 0.5,
          },
        },
        weight: 1.2,
      },
      {
        gauss: {
          creationDateForResource: {
            origin: 'now',
            scale: '365d',
            offset: '90d',
            decay: 0.5,
          },
        },
        weight: 1.0,
      },
    ],
  },
  // minScore: 0.75,
  // knn: {
  //   field: 'text_vector',
  //   query_vector: '',
  //   k: 10,
  //   num_candidates: 100,
  // },
  topTabAggregation: 'resourceType',
  hitsPerPageOptions: DEFAULT_SEARCH_APP_HITS_PER_PAGE_OPTIONS,
  sort: DEFAULT_SEARCH_APP_SORTOPTIONS,
  currentSort: DEFAULT_SEARCH_APP_SORTOPTIONS[0],
  resultsLayoutOptions: DEFAULT_SEARCH_LAYOUT_OPTIONS,
  filterPosition: 'side',
};
