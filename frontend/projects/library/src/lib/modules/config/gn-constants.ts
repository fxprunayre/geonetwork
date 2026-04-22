import { elasticsearch } from 'gn-api-client';
import { AppsConfiguration, I18nApp, RecordDetailsApp, SearchApp } from './model/gnConfig';

export const DEFAULT_SPACE = 'srv';

export const DEFAULT_LANGUAGE = 'eng';

export const DEFAULT_MAP_CONTEXT = {
  layers: [
    {
      type: 'xyz',
      id: 'basemap-osm',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      visibility: true,
      opacity: 1,
      label: 'OpenStreetMap',
      attributions: '© OpenStreetMap contributors',
      extras: {
        basemap: true,
      },
    },
  ],
  view: {
    center: [-4.56243, 0],
    zoom: 1,
  },
};

export const DEFAULT_HEADER_APP_CONFIGURATION: I18nApp = {
  enabled: true,
  languages: {
    eng: 'en',
    fre: 'fr',
  },
  language: DEFAULT_LANGUAGE,
};

export const DEFAULT_RECORD_VIEW_PROTOCOLS = [
  'OGC:WMS',
  'OGC:OWS-C',
  'OGC Web Map Service',
  'OGC:WMTS',
  'ESRI:REST',
];
export const DEFAULT_RECORD_DOWNLOAD_PROTOCOLS = [
  'WWW:DOWNLOAD',
  'WWW:DOWNLOAD.*',
  'WWW:OPENDAP',
  'WWW:FTP',
  'OGC:WFS',
  'OGC Web Feature Service',
  'OGC:WCS',
  'MYO:MOTU-SUB',
  'FILE',
  'COPYFILE',
  'DB',
  'KML',
];

export const DEFAULT_SEARCH_APP_AGGREGATIONS: (
  | string
  | Record<string, elasticsearch.AggregationsAggregationContainer>
)[] = [
  {
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
  {
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
  {
    'th_httpinspireeceuropaeutheme-theme_tree.key': {
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
    },
  },
  {
    'tag.default': {
      terms: {
        field: 'tag.default',
        include: '.*',
        size: 10,
      },
      meta: {
        collapsed: true,
        caseInsensitiveInclude: true,
      },
    },
  },
  {
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
  {
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
  {
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
  {
    resourceType: {
      terms: {
        field: 'resourceType',
        size: 10,
        exclude: 'map/.*|publication-.*',
      },
      meta: {
        collapsed: true,
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
    },
  },
];

export const DEFAULT_SEARCH_APP_SORTOPTIONS = [
  '-popularity',
  '_score',
  '-revisionDateForResource,-publicationDateForResource,-creationDateForResource',
  'resourceTitleObject.default.sort',
];

export const DEFAULT_SEARCH_APP_CONFIGURATION: SearchApp = {
  enabled: true,
  aggregations: DEFAULT_SEARCH_APP_AGGREGATIONS,
  topTabFilter: 'resourceType',
  hitsPerPageOptions: [20, 100],
  sort: DEFAULT_SEARCH_APP_SORTOPTIONS,
  currentSort: DEFAULT_SEARCH_APP_SORTOPTIONS[0],
  resultsLayoutOptions: ['grid', 'list'],
};

export const DEFAULT_RECORD_DETAILS_DISTRIBUTION_CONFIGURATION = {
  layout: '',
  sections: [
    {
      filter:
        'protocol:OGC:WMS|OGC:WMTS|ESRI:.*|atom.*|REST|OGC API Maps|OGC API Records|application/vnd.ogc.wms_xml',
      title: 'api',
    },
    {
      filter:
        'protocol:OGC:WFS|OGC:WCS|.*DOWNLOAD.*|DB:.*|COPYFILE|NETWORK:LINK|FILE:.*|OGC API Features|OGC API Coverages',
      title: 'download',
    },
    { filter: 'function:legend', title: 'mapLegend' },
    {
      filter: 'function:featureCatalogue',
      title: 'featureCatalog',
    },
    {
      filter: 'function:dataQualityReport',
      title: 'quality',
    },
    {
      filter:
        '-protocol:OGC.*|REST|ESRI:.*|atom.*|.*DOWNLOAD.*|DB:.*|COPYFILE|NETWORK:LINK|FILE:.*|application/vnd.ogc AND -function:legend|featureCatalogue|dataQualityReport',
      title: 'links',
    },
  ],
};

export const DEFAULT_RECORD_DETAILS_APP_CONFIGURATION: RecordDetailsApp = {
  enabled: true,
  mainThesaurus: [],
  distribution: DEFAULT_RECORD_DETAILS_DISTRIBUTION_CONFIGURATION,
};

export const DEFAULT_APPS_CONFIGURATION: AppsConfiguration = {
  apps: {
    i18n: DEFAULT_HEADER_APP_CONFIGURATION,
    search: DEFAULT_SEARCH_APP_CONFIGURATION,
    record: DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
  },
  proxyUrl: '/geonetwork/proxy?url=',
  backgroundImageUrl: '',
};
