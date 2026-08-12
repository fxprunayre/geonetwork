import { Gn4MapCommand } from '../record-distributions/map-service';

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
    parsed.searchParams.set('SERVICE', parsed.searchParams.get('SERVICE') || 'WMS');
    parsed.searchParams.set('REQUEST', parsed.searchParams.get('REQUEST') || 'GetMap');
    parsed.searchParams.set('VERSION', parsed.searchParams.get('VERSION') || '1.1.1');
    parsed.searchParams.set('FORMAT', parsed.searchParams.get('FORMAT') || 'image/png');
    parsed.searchParams.set('TRANSPARENT', parsed.searchParams.get('TRANSPARENT') || 'true');
    parsed.searchParams.set('STYLES', parsed.searchParams.get('STYLES') || '');
    parsed.searchParams.set('WIDTH', '256');
    parsed.searchParams.set('HEIGHT', '256');
    parsed.searchParams.set('SRS', parsed.searchParams.get('SRS') || 'EPSG:3857');
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
