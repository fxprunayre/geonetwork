export const DEFAULT_MAP_VIEW = {
  extent: [-180, -90, 180, 90],
  maxZoom: 12,
};

export const OSM_MAP_CONTEXT = {
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
};

export const SEXTANT_MAP_CONTEXT = {
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
};

export const DEFAULT_MAP_CONTEXT = SEXTANT_MAP_CONTEXT;
