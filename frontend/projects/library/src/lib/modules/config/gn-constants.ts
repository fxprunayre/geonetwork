import { elasticsearch } from 'gn-api-client';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { DEFAULT_THEME } from './default-theme';
import {
  AppsConfiguration,
  AuthenticationApp,
  HomeApp,
  I18nApp,
  RecordDetailsApp,
  SearchApp,
  SearchAppLayout,
  SharingApp,
  UserSelectionsApp,
} from './model/gnConfig';

export const DEFAULT_SPACE = 'srv';

export const DEFAULT_LANGUAGE = 'eng';

export const MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB = 'main-map-tab';
export const MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP = 'explore-embedded-map';
export type MapLayerDisplayTarget =
  | typeof MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB
  | typeof MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP;

export const DEFAULT_AUTHENTICATION_APP_CONFIGURATION: AuthenticationApp = {
  enabled: true,
};

export const DEFAULT_USER_SELECTIONS_APP_CONFIGURATION: UserSelectionsApp = {
  enabled: true,
};

export const DEFAULT_SHARING_APP_CONFIGURATION: SharingApp = {
  enabled: true,
  sharingMode: 'byGroup',
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
    extent: [-180, -90, 180, 90],
    maxZoom: 12,
  },
};

export const DEFAULT_SPATIAL_FILTER_BBOX_LAYER_STYLE = new Style({
  stroke: new Stroke({
    color: '#0f4c81',
    width: 3,
    lineDash: [12, 8],
  }),
  fill: new Fill({
    color: 'rgba(15, 76, 129, 0.02)',
  }),
});

export const DEFAULT_SPATIAL_FILTER_DRAW_LAYER_STYLE = new Style({
  stroke: new Stroke({
    color: '#0f4c81',
    width: 4,
    lineDash: [8, 6],
  }),
  fill: new Fill({
    color: 'rgba(15, 76, 129, 0.02)',
  }),
});

export const DEFAULT_SPATIAL_FILTER_HOVER_LAYER_STYLE = new Style({
  stroke: new Stroke({
    color: '#f8cc38',
    width: 4,
    lineDash: [8, 6],
  }),
  fill: new Fill({
    color: 'rgba(245, 158, 11, 0.22)',
  }),
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({
      color: 'rgba(245, 158, 11, 0.22)',
    }),
    stroke: new Stroke({
      color: '#f8cc38',
      width: 3,
    }),
  }),
});

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

export const DEFAULT_SEARCH_LAYOUT_OPTIONS: SearchAppLayout[] = ['list', 'grid'];

export const DEFAULT_SEARCH_APP_HITS_PER_PAGE_OPTIONS = [20, 100];

export const DEFAULT_SEARCH_APP_CONFIGURATION: SearchApp = {
  enabled: true,
  aggregations: DEFAULT_SEARCH_APP_AGGREGATIONS,
  topTabAggregation: 'resourceType',
  hitsPerPageOptions: DEFAULT_SEARCH_APP_HITS_PER_PAGE_OPTIONS,
  sort: DEFAULT_SEARCH_APP_SORTOPTIONS,
  currentSort: DEFAULT_SEARCH_APP_SORTOPTIONS[0],
  resultsLayoutOptions: DEFAULT_SEARCH_LAYOUT_OPTIONS,
  filterPosition: 'side',
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
        'protocol:OGC:WFS|OGC:WCS|.*DOWNLOAD.*|DB:.*|COPYFILE|NETWORK:LINK|FILE|FILE:.*|OGC API Features|OGC API Coverages',
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
        '-protocol:OGC.*|REST|ESRI:.*|atom.*|.*DOWNLOAD.*|DB:.*|COPYFILE|NETWORK:LINK|FILE|FILE:.*|application/vnd.ogc AND -function:legend|featureCatalogue|dataQualityReport',
      title: 'links',
    },
  ],
};

export const DEFAULT_RECORD_DETAILS_APP_CONFIGURATION: RecordDetailsApp = {
  enabled: true,
  mainThesaurus: [],
  distribution: DEFAULT_RECORD_DETAILS_DISTRIBUTION_CONFIGURATION,
  mapLayerDisplayTarget: MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  coverageSpatialDisplayType: 'dynamicMap',
};

export const DEFAULT_HOME_APP_CONFIGURATION: HomeApp = {
  enabled: true,
  aggregations: [
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
    menu: {
      enabled: true,
    },
    home: DEFAULT_HOME_APP_CONFIGURATION,
    i18n: DEFAULT_HEADER_APP_CONFIGURATION,
    authentication: DEFAULT_AUTHENTICATION_APP_CONFIGURATION,
    sharing: DEFAULT_SHARING_APP_CONFIGURATION,
    userSelections: DEFAULT_USER_SELECTIONS_APP_CONFIGURATION,
    search: DEFAULT_SEARCH_APP_CONFIGURATION,
    map: {
      enabled: true,
      context: DEFAULT_MAP_CONTEXT,
    },
    record: DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
    banner: {
      enabled: true,
      background: '',
      title: 'home.title',
      subTitle: 'home.subtitle',
      textColor: '#ffffff',
    },
  },
  proxyUrl: '/geonetwork/proxy?url=',
  theme: DEFAULT_THEME,
};

export const CARD_LINES_1 = `
<svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M312.082 142.787L312.051 142.787C253.301 156.716 211.795 204.088 185.007 254.885C158.211 305.697 146.205 359.822 146.388 387.03L146.388 387.034C146.388 414.476 136.528 431.444 126.632 441.551C121.69 446.6 116.746 449.929 113.035 451.997C111.179 453.031 109.63 453.751 108.543 454.212C107.999 454.443 107.571 454.61 107.277 454.719C107.13 454.774 107.016 454.814 106.939 454.841L106.895 454.856L106.85 454.871L106.818 454.882C106.817 454.882 106.817 454.882 106.662 454.407C106.507 453.931 106.508 453.931 106.508 453.931L106.512 453.93L106.531 453.924C106.548 453.918 106.575 453.909 106.61 453.896C106.681 453.872 106.788 453.834 106.928 453.782C107.209 453.677 107.623 453.517 108.152 453.292C109.21 452.843 110.726 452.139 112.548 451.123C116.191 449.093 121.054 445.819 125.918 440.851C135.636 430.926 145.388 414.207 145.388 387.035C145.205 359.627 157.268 305.342 184.123 254.419C210.978 203.493 252.689 155.812 311.871 141.802L311.923 141.79L311.977 141.789L311.98 141.789L311.994 141.789L312.051 141.787L312.115 141.785C312.142 141.784 312.174 141.783 312.21 141.781L312.281 141.778C312.487 141.769 312.795 141.752 313.199 141.722C314.009 141.663 315.207 141.551 316.75 141.344C319.837 140.93 324.307 140.132 329.824 138.599C340.857 135.533 356.077 129.524 372.791 117.755C406.21 94.2219 445.655 47.6205 469.516 -44.6797L470.484 -44.4294C446.574 48.0608 407.011 94.8811 373.367 118.572C356.549 130.415 341.222 136.469 330.092 139.563C324.527 141.109 320.012 141.916 316.883 142.335C315.319 142.545 314.101 142.659 313.273 142.719C312.858 142.75 312.541 142.767 312.327 142.777C312.219 142.782 312.138 142.785 312.082 142.787ZM56.5499 -43.9994C56.2067 -44.363 56.2063 -44.3627 56.2058 -44.3622L56.204 -44.3604L56.1971 -44.3539L56.1712 -44.3292C56.1485 -44.3075 56.1151 -44.2754 56.0714 -44.2329C55.9839 -44.148 55.8551 -44.0216 55.6881 -43.8545C55.3539 -43.5202 54.8667 -43.0227 54.2512 -42.3667C53.0201 -41.0546 51.2756 -39.108 49.2153 -36.5643C45.0951 -31.4773 39.7103 -23.9997 34.6454 -14.4304C24.5153 4.70903 15.6595 32.2284 20.7782 65.7184C28.1202 113.755 14.3808 145.146 -1.15539 164.527C-8.92884 174.224 -17.1602 180.924 -23.4461 185.198C-26.5887 187.335 -29.2441 188.865 -31.1112 189.859C-32.0447 190.357 -32.781 190.72 -33.2825 190.959C-33.5332 191.078 -33.7253 191.166 -33.8539 191.224C-33.9182 191.253 -33.9666 191.274 -33.9986 191.288L-34.0342 191.304L-34.0426 191.307L-34.0444 191.308C-34.0447 191.308 -34.0447 191.308 -33.8486 191.768C-33.6526 192.228 -33.6521 192.228 -33.6512 192.227L-33.6483 192.226L-33.6376 192.222L-33.5975 192.204C-33.5625 192.189 -33.511 192.166 -33.4435 192.136C-33.3087 192.075 -33.1103 191.984 -32.8531 191.862C-32.3386 191.617 -31.5886 191.247 -30.641 190.742C-28.7458 189.732 -26.0593 188.184 -22.8837 186.025C-16.5333 181.707 -8.2229 174.942 -0.375145 165.152C15.3311 145.56 29.1522 113.888 21.7667 65.5673C16.6884 32.3421 25.4714 5.04035 35.5292 -13.9626C40.5583 -23.4644 45.9048 -30.8882 49.9924 -35.9349C52.036 -38.4581 53.7645 -40.3864 54.9805 -41.6824C55.5885 -42.3305 56.0683 -42.8204 56.3953 -43.1475C56.5588 -43.3111 56.6841 -43.4339 56.7681 -43.5155C56.8101 -43.5563 56.8418 -43.5868 56.8627 -43.6068L56.8861 -43.6291L56.8929 -43.6356C56.8931 -43.6358 56.8931 -43.6358 56.5499 -43.9994ZM198.288 397.271L198.338 397.177L198.344 397.166C223.321 352.898 248.798 331.169 268.071 320.511C277.706 315.183 285.784 312.626 291.463 311.401C294.302 310.789 296.542 310.51 298.075 310.384C298.842 310.321 299.433 310.296 299.834 310.288C300.035 310.283 300.188 310.283 300.292 310.283C300.344 310.284 300.384 310.284 300.411 310.285L300.443 310.286L300.452 310.286L300.454 310.286C300.455 310.286 300.456 310.286 300.439 310.786C300.431 311.013 300.427 311.137 300.424 311.205C300.421 311.286 300.421 311.286 300.421 311.286L300.416 311.285L300.391 311.285C300.368 311.284 300.333 311.284 300.285 311.283C300.19 311.283 300.047 311.283 299.856 311.287C299.474 311.296 298.904 311.319 298.157 311.381C296.664 311.503 294.468 311.776 291.674 312.379C286.085 313.584 278.1 316.108 268.555 321.386C249.469 331.94 224.118 353.523 199.219 397.651L199.173 397.738C199.14 397.799 199.092 397.891 199.029 398.012C198.902 398.253 198.715 398.61 198.476 399.072C197.996 399.996 197.304 401.341 196.457 403.023C194.761 406.386 192.44 411.096 189.941 416.482C184.94 427.262 179.237 440.719 176.39 451.502L175.423 451.247C178.294 440.373 184.029 426.849 189.034 416.061C191.539 410.663 193.864 405.943 195.564 402.572C196.413 400.887 197.107 399.539 197.588 398.611C197.828 398.148 198.016 397.789 198.143 397.547C198.207 397.426 198.256 397.333 198.288 397.271Z" fill="#4A9DFF"/>
</svg>`;
export const CARD_LINES_2 = `<svg width="300" height="400" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M146.388 47.5851C146.205 20.3766 158.211 -33.7476 185.007 -84.56C211.803 -135.372 253.325 -182.756 312.101 -196.669L311.871 -197.643C252.689 -183.633 210.978 -135.952 184.122 -85.0265C157.268 -34.103 145.204 20.1815 145.388 47.5895C145.388 74.7622 135.635 91.4807 125.918 101.406C121.054 106.374 116.191 109.648 112.548 111.678C110.726 112.694 109.21 113.398 108.152 113.847C107.623 114.071 107.209 114.232 106.928 114.337C106.788 114.389 106.681 114.427 106.61 114.451L106.578 114.462C106.558 114.469 106.543 114.475 106.531 114.479L106.512 114.485L106.507 114.486L106.494 114.491L106.481 114.496L106.466 114.501L106.416 114.52L106.334 114.551L106.213 114.596C106.03 114.664 105.754 114.764 105.383 114.895C104.64 115.157 103.516 115.542 101.992 116.031C98.945 117.009 94.3022 118.405 87.9293 120.069C75.1834 123.397 55.5168 127.801 27.8523 132.098L27.843 132.099L27.8338 132.101C-11.3963 139.716 -30.45 154.76 -39.6826 167.981C-44.2954 174.586 -46.4435 180.718 -47.4376 185.207C-47.9345 187.451 -48.143 189.284 -48.2271 190.56C-48.2691 191.199 -48.28 191.698 -48.2803 192.039C-48.2804 192.21 -48.2779 192.342 -48.2753 192.432C-48.2739 192.477 -48.2726 192.512 -48.2716 192.535L-48.2703 192.563L-48.2699 192.571L-48.2697 192.574C-48.2697 192.574 -48.2697 192.575 -47.7705 192.546C-47.3595 192.523 -47.2869 192.518 -47.2741 192.517L-47.2713 192.517L-47.2715 192.513L-47.2725 192.492C-47.2734 192.473 -47.2745 192.443 -47.2757 192.403C-47.278 192.323 -47.2804 192.201 -47.2803 192.04C-47.28 191.719 -47.2697 191.242 -47.2292 190.626C-47.1482 189.395 -46.9461 187.613 -46.4612 185.423C-45.4916 181.045 -43.3909 175.037 -38.8627 168.553C-29.8143 155.596 -11.0204 140.664 28.0152 133.085C55.7061 128.783 75.4029 124.373 88.1819 121.036C94.5722 119.368 99.2326 117.967 102.298 116.983C103.83 116.491 104.964 116.104 105.716 115.838C106.092 115.706 106.372 115.604 106.559 115.534C106.605 115.518 106.644 115.503 106.679 115.49C106.715 115.476 106.746 115.465 106.77 115.456L106.823 115.436L106.826 115.434L106.837 115.43L106.85 115.426L106.89 115.413L106.939 115.396C106.982 115.381 107.036 115.362 107.1 115.339L107.16 115.317C107.196 115.304 107.235 115.289 107.277 115.274C107.571 115.165 107.999 114.998 108.543 114.767C109.63 114.306 111.179 113.586 113.034 112.552C116.746 110.484 121.689 107.154 126.632 102.106C136.528 91.9988 146.388 75.031 146.388 47.5885L146.388 47.5851ZM194.269 291.972C207.022 266.194 244.066 220.797 293.5 185.553C342.933 150.309 404.646 125.293 466.754 140.076L466.986 139.104C404.472 124.223 342.457 149.42 292.919 184.739C243.384 220.056 206.215 265.57 193.374 291.527C180.464 317.186 163.311 328.342 149.416 333.099C142.461 335.48 136.313 336.261 131.907 336.447C129.704 336.541 127.937 336.485 126.724 336.407C126.118 336.367 125.65 336.323 125.335 336.288C125.243 336.278 125.165 336.268 125.1 336.26C125.053 336.254 125.013 336.249 124.98 336.245C124.94 336.24 124.911 336.236 124.892 336.233L124.865 336.229L124.852 336.227L124.837 336.226L124.834 336.225L124.821 336.224L124.765 336.218L124.676 336.209C124.636 336.204 124.59 336.199 124.536 336.193C124.332 336.17 124.023 336.134 123.61 336.081C122.785 335.976 121.54 335.805 119.869 335.543C116.527 335.019 111.481 334.131 104.674 332.675C91.0592 329.763 70.4002 324.579 42.2418 315.496L42.2329 315.493L42.2238 315.491C1.57699 304.048 -23.5477 309.201 -38.5351 317.292C-46.0233 321.335 -50.9611 326.102 -54.0295 329.865C-55.5635 331.746 -56.6302 333.376 -57.3151 334.54C-57.6575 335.122 -57.9046 335.587 -58.0669 335.909C-58.1481 336.07 -58.2081 336.196 -58.2482 336.282C-58.2671 336.322 -58.2816 336.354 -58.2919 336.377L-58.3333 336.44C-58.3756 336.504 -58.4386 336.6 -58.5214 336.728C-58.6872 336.982 -58.9324 337.361 -59.251 337.858C-59.8882 338.853 -60.819 340.321 -61.9947 342.218C-64.3459 346.013 -67.6765 351.525 -71.5957 358.396C-79.4338 372.137 -89.6285 391.32 -99.0532 413.08L-98.1356 413.477C-88.7293 391.759 -78.5526 372.611 -70.7271 358.891C-66.8146 352.032 -63.4903 346.531 -61.1446 342.745C-59.9718 340.852 -59.0437 339.388 -58.409 338.398C-58.0917 337.903 -57.8478 337.526 -57.6833 337.273L-57.5861 337.124L-57.497 336.988L-57.45 336.916L-57.4382 336.898L-57.4345 336.893L-57.4103 336.856L-57.3927 336.816L-57.3908 336.811L-57.3818 336.791C-57.3734 336.772 -57.3602 336.743 -57.3422 336.705C-57.3062 336.628 -57.2505 336.511 -57.174 336.36C-57.0208 336.056 -56.7841 335.609 -56.4532 335.047C-55.7914 333.923 -54.7533 332.335 -53.2545 330.497C-50.2575 326.821 -45.4182 322.145 -38.06 318.172C-23.3557 310.234 1.487 305.064 41.9439 316.451C70.1278 325.542 90.8165 330.733 104.464 333.653C111.289 335.112 116.353 336.004 119.714 336.531C121.394 336.794 122.648 336.967 123.484 337.073C123.614 337.09 123.733 337.105 123.843 337.118C124.086 337.148 124.28 337.171 124.424 337.187C124.529 337.199 124.607 337.207 124.66 337.213L124.72 337.219L124.724 337.219L124.735 337.22L124.75 337.223C124.773 337.226 124.806 337.231 124.848 337.236C124.934 337.248 125.06 337.263 125.225 337.282C125.554 337.318 126.037 337.364 126.66 337.405C127.904 337.485 129.707 337.541 131.949 337.447C136.433 337.257 142.678 336.462 149.74 334.045C163.875 329.206 181.237 317.875 194.268 291.975L194.269 291.972Z" fill="#4A9DFF"/>
</svg>`;
