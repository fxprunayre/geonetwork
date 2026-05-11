import { elasticsearch } from 'gn-api-client';
import { DEFAULT_THEME } from './default-theme';
import {
  AppsConfiguration,
  AuthenticationApp,
  HomeApp,
  I18nApp,
  RecordDetailsApp,
  SearchApp,
} from './model/gnConfig';

export const DEFAULT_SPACE = 'srv';

export const DEFAULT_LANGUAGE = 'eng';

export const DEFAULT_AUTHENTICATION_APP_CONFIGURATION: AuthenticationApp = {
  enabled: true,
};

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
    'th_httpinspireeceuropaeutheme-theme_tree.key': INSPIRE_AGGREGATION,
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
    resourceType: RESOURCE_TYPE_AGGREGATION,
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

export const DEFAULT_HOME_APP_CONFIGURATION: HomeApp = {
  enabled: true,
  aggregations: [
    {
      resourceType: {
        terms: {
          field: 'resourceType',
          size: 9,
          exclude: 'publication-.*',
        },
        meta: {
          layout: 'nightingale',
          decorator: {
            type: 'icon',
            prefix: '',
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
    {
      'th_sextant-theme_tree.key': {
        terms: {
          field: 'th_sextant-theme_tree.key',
          size: 9,
          include: '[^^]+',
        },
        meta: {
          orderByTranslation: true,
          translateOnLoad: true,
          layout: 'card',
          decorator: {
            type: 'img',
            map: {
              // Imagery
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/34bad830-04ed-4d92-83ad-bf35d5c840a1':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/hyperspectrale-la-reunion/1603154-3-fre-FR/Hyperspectrale-La-Reunion.png',
              // Biologique
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/c17e50a2-5e3d-40da-94e0-b31327977947':
                'https://sextant.ifremer.fr/geonetwork/srv/api/records/d90bc6fa-5416-4064-97b6-8f671de3e407/attachments/zfhi.jpg',
              // Physique
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/d6f5b49f-fa79-4788-a34c-ab342cb85463':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/habitats-physiques/1595588-2-fre-FR/Habitats-physiques.png',
              // Maps
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/ac4c92ba-171b-4e0a-aa3b-a81adf497921':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/bathymetrie-emodnet/1595576-2-fre-FR/Bathymetrie-Emodnet.png',
              // Regulation
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/73a55b62-adf3-4b89-9fd2-5f277cffb47b':
                'https://sextant.ifremer.fr/geonetwork/srv/api/records/d275ec6a-603b-4170-add2-9b52ce190793/attachments/165.JPG',
              // Activité
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/7898b87e-208a-421f-b1b4-3697f895ddd9':
                'https://sextant.ifremer.fr/documentation/emodnet_chemistry/images/2023/mlf_density_nb_l_other.png',
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/355023fd-7289-40ce-8c5c-c725232e039f':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/bigood/1595612-3-fre-FR/BIGOOD.png',
            },
          },
        },
      },
    },
    {
      'th_httpinspireeceuropaeutheme-theme_tree.key': {
        terms: {
          field: 'th_httpinspireeceuropaeutheme-theme_tree.key',
          size: 34,
          // order: { _key: 'asc' },
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
      'th_simm-reglementaire_tree.key': {
        terms: {
          field: 'th_simm-reglementaire_tree.key',
          size: 9,
        },
        meta: {
          thesaurus: 'simm.reglementaire',
          translateOnLoad: true,
          layout: 'card',
        },
      },
    },
    {
      'th_dcsmm-area_tree.key': {
        terms: {
          field: 'th_dcsmm-area_tree.key',
          size: 30,
        },
        meta: {
          layout: 'bar',
          thesaurus: 'dcsmm.area',
          translateOnLoad: true,
        },
      },
    },
    {
      'th_dcsmm-descripteur_tree.key': {
        terms: {
          field: 'th_dcsmm-descripteur_tree.key',
          size: 30,
        },
        meta: {
          translateOnLoad: true,
          layout: 'card',
        },
      },
    },
    {
      'th_odatis_centre_donnees_tree.key': {
        terms: {
          field: 'th_odatis_centre_donnees_tree.key',
          size: 30,
        },
        meta: {
          translateOnLoad: true,
          layout: 'treemap',
        },
      },
    },
    {
      'th_NVS-OD1_tree.key': {
        terms: {
          field: 'th_NVS-OD1_tree.key',
          size: 30,
        },
        meta: {
          thesaurus: 'NVS.OD1',
          translateOnLoad: true,
          layout: 'card',
        },
      },
    },
  ],
};

export const DEFAULT_APPS_CONFIGURATION: AppsConfiguration = {
  apps: {
    home: DEFAULT_HOME_APP_CONFIGURATION,
    i18n: DEFAULT_HEADER_APP_CONFIGURATION,
    authentication: DEFAULT_AUTHENTICATION_APP_CONFIGURATION,
    search: DEFAULT_SEARCH_APP_CONFIGURATION,
    map: {
      enabled: true,
      context: DEFAULT_MAP_CONTEXT,
    },
    record: DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
  },
  proxyUrl: '/geonetwork/proxy?url=',
  backgroundImageUrl: '',
  theme: DEFAULT_THEME,
};
