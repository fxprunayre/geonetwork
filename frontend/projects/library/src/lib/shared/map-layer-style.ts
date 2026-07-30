import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

export interface ThemeAwareVectorLayerStyleOptions {
  fillAlpha?: number;
  strokeWidth?: number;
  markerRadius?: number;
  strokeColorVarNames?: string[];
  fillColorVarNames?: string[];
  fallbackStrokeColor?: string;
  fallbackFillColor?: string;
  fallbackMarkerStrokeColor?: string;
  fallbackMarkerFillColor?: string;
  markerStrokeWidth?: number;
}

function normalizeCssColor(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim() || '';
  return trimmed.startsWith('#') || trimmed.startsWith('rgb') || trimmed.startsWith('hsl')
    ? trimmed
    : fallback;
}

function readCssVariableColor(
  cssVariables: string[] | undefined,
  fallback: string,
  root: ParentNode = document.documentElement,
): string {
  const computedStyle = getComputedStyle(root as Element);
  for (const cssVariable of cssVariables || []) {
    const candidate = computedStyle.getPropertyValue(cssVariable);
    if (candidate && candidate.trim()) {
      return normalizeCssColor(candidate, fallback);
    }
  }
  return fallback;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalizedHex = hex.startsWith('#') ? hex.substring(1) : hex;
  if (normalizedHex.length !== 6) {
    return hex;
  }

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function createThemeAwareVectorLayerStyle(
  options: ThemeAwareVectorLayerStyleOptions = {},
  root: ParentNode = document.documentElement,
): Style {
  const strokeColor = readCssVariableColor(
    options.strokeColorVarNames,
    options.fallbackStrokeColor ?? '#093564',
    root,
  );
  const fillColor = readCssVariableColor(
    options.fillColorVarNames,
    options.fallbackFillColor ?? strokeColor,
    root,
  );
  const markerFillColor = options.fallbackMarkerFillColor ?? fillColor;
  const markerStrokeColor = options.fallbackMarkerStrokeColor ?? strokeColor;
  const fillAlpha = options.fillAlpha ?? 0.1;

  return new Style({
    stroke: new Stroke({
      color: strokeColor,
      width: options.strokeWidth ?? 2,
    }),
    fill: new Fill({
      color: hexToRgba(fillColor, fillAlpha),
    }),
    image: new CircleStyle({
      radius: options.markerRadius ?? 6,
      fill: new Fill({
        color: hexToRgba(markerFillColor, fillAlpha),
      }),
      stroke: new Stroke({
        color: markerStrokeColor,
        width: options.markerStrokeWidth ?? options.strokeWidth ?? 2,
      }),
    }),
  });
}
