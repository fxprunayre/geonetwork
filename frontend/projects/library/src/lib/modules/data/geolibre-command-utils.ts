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

  if (layerType === 'wfs') {
    const wfs = buildWfsSource(url, name);
    return {
      id: layerId,
      type: 'geojson',
      name: label,
      source: {
        type: 'geojson',
        url: wfs.url,
        service: 'wfs',
        typeName: wfs.typeName,
        version: wfs.version,
        outputFormat: wfs.outputFormat,
        srsName: wfs.srsName,
        ...(boundsWgs84 ? { bounds: boundsWgs84 } : {}),
      },
      visible: true,
      opacity: 1,
      metadata: {
        featureCount: readOptionalPositiveIntegerQueryParam(wfs.url, ['count', 'maxFeatures']),
        service: 'wfs',
        sourceKind: 'wfs-getfeature',
        typeName: wfs.typeName,
        layerName: name,
        layerType: 'wfs',
        ...(boundsWgs84 ? { bounds: boundsWgs84 } : {}),
        ...(boundsWgs84 ? { boundsWgs84: formatBounds(boundsWgs84) } : {}),
      },
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

export async function hydrateWfsLayerSpecWithGeoJson(spec: AddLayerSpec): Promise<AddLayerSpec> {
  if (spec.type !== 'geojson') {
    return spec;
  }

  const source = (spec.source || {}) as Record<string, unknown>;
  if (source['service'] !== 'wfs') {
    return spec;
  }

  const sourceUrl = source['url'];
  if (typeof sourceUrl !== 'string' || !sourceUrl) {
    return spec;
  }

  try {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      return spec;
    }

    const payload: unknown = await response.json();
    if (!isGeoJsonFeatureCollection(payload)) {
      return spec;
    }

    const featureCount = payload.features.length;
    return {
      ...spec,
      geojson: payload,
      metadata: {
        ...(spec.metadata || {}),
        ...(featureCount >= 0 ? { featureCount } : {}),
      },
    };
  } catch {
    return spec;
  }
}

function readOptionalPositiveIntegerQueryParam(url: string, names: string[]): number | undefined {
  try {
    const parsed = new URL(url);
    for (const name of names) {
      const value =
        parsed.searchParams.get(name) ||
        parsed.searchParams.get(name.toUpperCase()) ||
        parsed.searchParams.get(name.toLowerCase());
      if (!value) {
        continue;
      }
      const num = Number(value);
      if (Number.isInteger(num) && num > 0) {
        return num;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function isGeoJsonFeatureCollection(
  value: unknown,
): value is { type: 'FeatureCollection'; features: unknown[] } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate['type'] === 'FeatureCollection' && Array.isArray(candidate['features']);
}

export function buildWfsSource(
  url: string,
  typeName: string,
): {
  url: string;
  typeName: string;
  version: string;
  outputFormat: string;
  srsName: string;
} {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('SERVICE', parsed.searchParams.get('SERVICE') || 'WFS');
    parsed.searchParams.set('REQUEST', parsed.searchParams.get('REQUEST') || 'GetFeature');
    parsed.searchParams.set('VERSION', parsed.searchParams.get('VERSION') || '1.1.0');
    const resolvedVersion = parsed.searchParams.get('VERSION') || '1.1.0';

    const typeParamName = resolveWfsTypeNameParameter(resolvedVersion, parsed.searchParams);

    if (typeName) {
      parsed.searchParams.set(typeParamName, typeName);
    }

    parsed.searchParams.set('SRSNAME', parsed.searchParams.get('SRSNAME') || 'EPSG:4326');

    const outputFormat =
      parsed.searchParams.get('OUTPUTFORMAT') || parsed.searchParams.get('outputFormat');
    if (!outputFormat) {
      parsed.searchParams.set('OUTPUTFORMAT', 'application/json');
    }

    const resolvedTypeName =
      parsed.searchParams.get('TYPENAMES') ||
      parsed.searchParams.get('typenames') ||
      parsed.searchParams.get('TYPENAME') ||
      parsed.searchParams.get('typename') ||
      typeName ||
      '';

    return {
      url: parsed.toString(),
      typeName: resolvedTypeName,
      version: resolvedVersion,
      outputFormat:
        parsed.searchParams.get('OUTPUTFORMAT') ||
        parsed.searchParams.get('outputFormat') ||
        'application/json',
      srsName: parsed.searchParams.get('SRSNAME') || 'EPSG:4326',
    };
  } catch {
    return {
      url,
      typeName: typeName || '',
      version: '1.1.0',
      outputFormat: 'application/json',
      srsName: 'EPSG:4326',
    };
  }
}

function resolveWfsTypeNameParameter(
  version: string,
  params: URLSearchParams,
): 'TYPENAME' | 'TYPENAMES' {
  if (params.has('TYPENAMES') || params.has('typenames')) {
    return 'TYPENAMES';
  }
  if (params.has('TYPENAME') || params.has('typename')) {
    return 'TYPENAME';
  }

  return version.startsWith('2.') ? 'TYPENAMES' : 'TYPENAME';
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
