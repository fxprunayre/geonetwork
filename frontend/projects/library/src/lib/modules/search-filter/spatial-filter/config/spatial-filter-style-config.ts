import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

export const DEFAULT_SPATIAL_FILTER_BBOX_LAYER_STYLE = new Style({
  stroke: new Stroke({
    color: '#0f4c81',
    width: 3,
    lineDash: [12, 8],
  }),
  fill: new Fill({
    color: 'rgba(15, 76, 129, 0.0)',
  }),
});

export const DEFAULT_SPATIAL_FILTER_DRAW_LAYER_STYLE = new Style({
  stroke: new Stroke({
    color: '#0f4c81',
    width: 4,
    lineDash: [8, 6],
  }),
  fill: new Fill({
    color: 'rgba(15, 76, 129, 0.0)',
  }),
});

export const DEFAULT_SPATIAL_FILTER_LAYER_STYLE = new Style({
  stroke: new Stroke({
    color: '#0f4c81',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(245, 158, 11, 0.01)',
  }),
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({
      color: 'rgba(245, 158, 11, 0.01)',
    }),
    stroke: new Stroke({
      color: '#f8cc38',
      width: 3,
    }),
  }),
});

export const DEFAULT_SPATIAL_FILTER_HOVER_LAYER_STYLE = new Style({
  stroke: new Stroke({
    color: '#f8cc38',
    width: 4,
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
