import type { RecordDetailsApp } from '../../config/model/gnConfig';

export const MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB = 'main-map-tab';
export const MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP = 'explore-embedded-map';
export type MapLayerDisplayTarget =
  | typeof MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB
  | typeof MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP;

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
  showDiscussionTab: true,
  showVersionWidgets: true,
};
