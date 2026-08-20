import { MapContext, MapType } from '../../config/model/gnConfig';

// export const DEFAULT_MAP_TYPE: MapType = 'geolibre';
export const DEFAULT_MAP_TYPE: MapType = 'geospatialsdk';

export const DEFAULT_MAP_VIEW = {
  extent: [-180, -90, 180, 90],
  maxZoom: 28,
};

export const OSM_MAP_CONTEXT: MapContext = {
  layers: [],
  backgroundLayers: [
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
  view: DEFAULT_MAP_VIEW,
  dataSources: [
    {
      url: 'https://sextant.ifremer.fr/geonetwork/index/features',
      type: 'geonetwork-index',
    },
  ],
};

export const SEXTANT_MAP_CONTEXT: MapContext = {
  layers: [],
  backgroundLayers: [
    {
      type: 'xyz',
      id: 'basemap-osm',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      visibility: true,
      opacity: 1,
      label: 'OpenStreetMap',
      attributions: '© OpenStreetMap contributors',
    },
    {
      type: 'wmts',
      id: 'sextant',
      url: 'https://sextant.ifremer.fr/geowebcache/service/wmts?SERVICE=wmts&amp;REQUEST=getcapabilities&amp;VERSION=1.0.0',
      visibility: false,
      opacity: 1,
      name: 'sextant',
      label: 'Sextant',
    },
  ],
  view: DEFAULT_MAP_VIEW,
  dataSources: [
    {
      url: 'https://sextant.ifremer.fr/geonetwork/index/features',
      type: 'geonetwork-index',
    },
  ],
};

export const DEFAULT_MAP_CONTEXT = SEXTANT_MAP_CONTEXT;

export const DEFAULT_BASIC_MAP_CONTEXT: MapContext = {
  layers: Array.isArray(DEFAULT_MAP_CONTEXT['backgroundLayers'])
    ? (DEFAULT_MAP_CONTEXT['backgroundLayers'] as any[])
        .filter((layer) => layer.visibility !== false)
        .slice(0, 1)
    : [],
  view: DEFAULT_MAP_VIEW,
};

export const DEFAULT_GEOSPATIALSDK_MAP_CONFIGURATION = {
  context: SEXTANT_MAP_CONTEXT,
};

export const DEFAULT_GEOLIBRE_MAP_CONFIGURATION = {
  embedUrl: '/geolibre/?embed=1',
  projectUrl: '/assets/geolibre/sextant-project.json',
};
