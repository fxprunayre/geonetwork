import type { AddLayerSpec } from '@geolibre/embed';
import { Gn4MapCommand } from '../record-distributions/map-service';

export const DEFAULT_TILE_SIZE = 512;
export const DEFAULT_WMS_VERSION = '1.3.0';

export function extractWmsLayerName(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('LAYERS') || parsed.searchParams.get('layers') || '';
  } catch {
    return '';
  }
}

export function buildWmsTileUrl(url: string, layerName: string): string {
  try {
    const parsed = new URL(url);
    const version = parsed.searchParams.get('VERSION') || DEFAULT_WMS_VERSION;
    parsed.searchParams.set('SERVICE', parsed.searchParams.get('SERVICE') || 'WMS');
    parsed.searchParams.set('REQUEST', parsed.searchParams.get('REQUEST') || 'GetMap');
    parsed.searchParams.set('VERSION', version);
    parsed.searchParams.set('FORMAT', parsed.searchParams.get('FORMAT') || 'image/png');
    parsed.searchParams.set('TRANSPARENT', parsed.searchParams.get('TRANSPARENT') || 'true');
    parsed.searchParams.set('STYLES', parsed.searchParams.get('STYLES') || '');
    parsed.searchParams.set('WIDTH', DEFAULT_TILE_SIZE.toString());
    parsed.searchParams.set('HEIGHT', DEFAULT_TILE_SIZE.toString());
    const crsParam = version === '1.3.0' ? 'CRS' : 'SRS';
    parsed.searchParams.set(crsParam, parsed.searchParams.get(crsParam) || 'EPSG:3857');
    if (layerName) {
      parsed.searchParams.set('LAYERS', layerName);
    }
    parsed.searchParams.set('BBOX', '{bbox-epsg-3857}');
    return parsed.toString().replace(/%7Bbbox-epsg-3857%7D/gi, '{bbox-epsg-3857}');
  } catch {
    return url;
  }
}

export function extractEndpoint(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export function readQueryParam(url: string, name: string): string {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get(name) || parsed.searchParams.get(name.toLowerCase()) || '';
  } catch {
    return '';
  }
}

export function resolveCommandBoundsWgs84(
  cmd: Gn4MapCommand,
): [number, number, number, number] | null {
  if (!Array.isArray(cmd.boundsWgs84) || cmd.boundsWgs84.length !== 4) {
    return null;
  }

  return normalizeBbox(cmd.boundsWgs84.map((value) => Number(value)));
}

export function formatBounds([minx, miny, maxx, maxy]: [number, number, number, number]): string {
  return `${minx}, ${miny}, ${maxx}, ${maxy}`;
}

export function buildGeoLibreLayerSpec(
  layerId: string,
  cmd: Gn4MapCommand,
  boundsWgs84: [number, number, number, number] | null,
): AddLayerSpec {
  const layerType = cmd.type || 'wms';
  const url = decodeURIComponent(cmd.url);
  const name = decodeURIComponent(cmd.name || '');
  const label = decodeURIComponent(cmd.label || name || layerId);

  if (layerType === 'wmts') {
    return {
      id: layerId,
      type: 'raster',
      name: label,
      source: {
        type: 'raster',
        tiles: [url],
        tileSize: DEFAULT_TILE_SIZE,
      },
      visible: true,
      opacity: 1,
    };
  }

  const wmsLayerName = extractWmsLayerName(url) || name;
  const wmsTilesUrl = buildWmsTileUrl(url, wmsLayerName);
  const wmsEndpoint = extractEndpoint(url);
  const wmsVersion = readQueryParam(url, 'VERSION') || DEFAULT_WMS_VERSION;
  const wmsFormat = readQueryParam(url, 'FORMAT') || 'image/png';
  const wmsTransparent = (readQueryParam(url, 'TRANSPARENT') || 'true').toLowerCase() !== 'false';
  const wmsStyles = readQueryParam(url, 'STYLES') || '';

  return {
    id: layerId,
    type: 'wms',
    name: label,
    source: {
      type: 'raster',
      tiles: [wmsTilesUrl],
      tileSize: DEFAULT_TILE_SIZE,
      url: wmsEndpoint,
      layers: wmsLayerName,
      styles: wmsStyles,
      format: wmsFormat,
      transparent: wmsTransparent,
      version: wmsVersion,
      ...(boundsWgs84 ? { bounds: boundsWgs84 } : {}),
    },
    visible: true,
    opacity: 1,
    metadata: {
      service: 'wms',
      layerName: wmsLayerName || name,
      layerType: 'wms',
      ...(boundsWgs84 ? { bounds: boundsWgs84 } : {}),
      ...(boundsWgs84 ? { boundsWgs84: formatBounds(boundsWgs84) } : {}),
    },
  };
}

function normalizeBbox(values: number[]): [number, number, number, number] | null {
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const minx = Math.min(values[0], values[2]);
  const miny = Math.min(values[1], values[3]);
  const maxx = Math.max(values[0], values[2]);
  const maxy = Math.max(values[1], values[3]);
  if (minx === maxx || miny === maxy) {
    return null;
  }

  return [minx, miny, maxx, maxy];
}
