import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  untracked,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { createMapFromContext } from '@geospatial-sdk/openlayers';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEraser, faSolidPenToSquare } from '@ng-icons/font-awesome/solid';
import {
  DEFAULT_MAP_CONTEXT,
  DEFAULT_SPATIAL_FILTER_BBOX_LAYER_STYLE,
  DEFAULT_SPATIAL_FILTER_HOVER_LAYER_STYLE,
  SearchBase,
  SearchMapOverlayService,
  SpatialBBox,
} from 'gn-library';
import { createEmpty, extend, isEmpty } from 'ol/extent';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import type Geometry from 'ol/geom/Geometry';
import { fromExtent as polygonFromExtent } from 'ol/geom/Polygon';
import Draw, { createBox } from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import { transformExtent } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-spatial-filter',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, NgIcon],
  viewProviders: [
    provideIcons({
      faPenToSquare: faSolidPenToSquare,
      faSolidEraser,
    }),
  ],
  templateUrl: './spatial-filter.html',
  encapsulation: ViewEncapsulation.None,
  styles: `
    @import 'ol/ol.css';

    app-spatial-filter .ol-control button {
      background-color: var(--p-primary-500, #093564);
      color: white;
    }

    app-spatial-filter .ol-control button:hover,
    app-spatial-filter .ol-control button:focus {
      background-color: var(--p-primary-600, #082d55);
    }
  `,
})
export class SpatialFilterComponent extends SearchBase implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  private readonly searchMapOverlayService = inject(SearchMapOverlayService);
  private readonly geoJsonFormat = new GeoJSON();

  bbox = signal<SpatialBBox | null>(null);
  bboxCenter = signal<[number, number] | null>(null);

  primaryActionIcon = computed(() => (this.bbox() ? 'faSolidEraser' : 'faPenToSquare'));

  primaryActionTooltip = computed(() =>
    this.bbox() ? 'Clear spatial filter' : 'Draw a bounding box',
  );

  private map: OlMap | null = null;
  private drawInteraction: Draw | null = null;
  private resultsSource = new VectorSource();
  private hoverSource = new VectorSource();

  private resultFeaturesByRecordId = new globalThis.Map<string, Feature<Geometry>[]>();

  private bboxSource = new VectorSource();
  private bboxLayer = new VectorLayer({
    source: this.bboxSource,
    style: DEFAULT_SPATIAL_FILTER_BBOX_LAYER_STYLE,
  });
  private resultsLayer = new VectorLayer({
    source: this.resultsSource,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(9, 53, 100, 0.45)',
        width: 1.5,
      }),
      fill: new Fill({
        color: 'rgba(9, 53, 100, 0.08)',
      }),
      image: new CircleStyle({
        radius: 4,
        fill: new Fill({ color: 'rgba(9, 53, 100, 0.5)' }),
      }),
    }),
  });

  private hoverLayer = new VectorLayer({
    source: this.hoverSource,
    style: DEFAULT_SPATIAL_FILTER_HOVER_LAYER_STYLE,
  });

  constructor() {
    super();
    effect(() => {
      this.searchMapOverlayService.getPageResultsState()();
      untracked(() => this.syncResultsFeatures());
    });

    effect(() => {
      this.searchMapOverlayService.getHoveredRecordState()();
      this.syncHoveredFeature();
    });

    effect(() => {
      this.searchMapOverlayService.getZoomToRecordRequestState()();
      const request = this.searchMapOverlayService.getZoomToRecordRequest(this.scope());
      if (!request?.recordId) {
        return;
      }
      this.zoomToRecordExtent(request.recordId);
    });

    effect(() => {
      this.search().filter();
      untracked(() => this.syncBboxFromSearchFilter());
    });
  }

  ngAfterViewInit(): void {
    const mapContext = JSON.parse(JSON.stringify(DEFAULT_MAP_CONTEXT));
    this.map = createMapFromContext(mapContext, this.mapContainer.nativeElement);

    this.resultsLayer.setZIndex(990);
    this.hoverLayer.setZIndex(1000);

    this.map.addLayer(this.resultsLayer);
    this.bboxLayer.setZIndex(999);
    this.map.addLayer(this.hoverLayer);
    this.map.addLayer(this.bboxLayer);

    setTimeout(() => {
      this.map?.updateSize();
    });

    this.syncResultsFeatures();
    this.syncHoveredFeature();
    this.syncBboxFromSearchFilter();
  }

  ngOnDestroy(): void {
    this.removeDrawInteraction();
    if (this.map) {
      this.map.setTarget(undefined);
      this.map = null;
    }
  }

  startDrawBbox() {
    if (!this.map) {
      return;
    }

    this.removeDrawInteraction();

    const draw = new Draw({
      source: this.bboxSource,
      type: 'Circle',
      geometryFunction: createBox(),
    });

    draw.on('drawstart', () => {
      this.bboxSource.clear();
    });

    draw.on('drawend', (event) => {
      const extent3857 = event.feature.getGeometry()?.getExtent();
      this.removeDrawInteraction();

      if (!extent3857) {
        return;
      }

      const [west, south, east, north] = transformExtent(extent3857, 'EPSG:3857', 'EPSG:4326');
      this.bbox.set({ west, south, east, north });
      this.bboxCenter.set([(west + east) / 2, (south + north) / 2]);
      this.renderBboxFeature({ west, south, east, north });

      this.applySpatialFilter();
    });

    this.drawInteraction = draw;
    this.map.addInteraction(draw);
  }

  clearBbox() {
    this.bboxSource.clear();
    this.bbox.set(null);
    this.bboxCenter.set(null);
    this.removeDrawInteraction();

    const nextFilter = this.searchService.removeSpatialEnvelopeFilters(
      this.search().filter(),
      'geom',
    );
    this.search().setFilter(nextFilter);
  }

  onPrimaryAction() {
    if (this.bbox()) {
      this.clearBbox();
      return;
    }
    this.startDrawBbox();
  }

  private applySpatialFilter() {
    const currentBbox = this.bbox();
    if (!currentBbox) {
      return;
    }

    const nextFilter = this.searchService.applySpatialEnvelopeFilter(
      this.search().filter(),
      'geom',
      currentBbox,
      'intersects',
    );
    this.search().setFilter(nextFilter);
  }

  private syncBboxFromSearchFilter() {
    const spatialFilterData = this.searchService.extractSpatialEnvelopeFilter(
      this.search().filter(),
      'geom',
    );
    if (!spatialFilterData) {
      if (this.bbox()) {
        this.bboxSource.clear();
        this.bbox.set(null);
        this.bboxCenter.set(null);
        this.removeDrawInteraction();
        this.map?.renderSync();
      }
      return;
    }

    const restoredBbox = spatialFilterData.bbox;
    if (this.bbox() && this.areBboxesEqual(this.bbox() as SpatialBBox, restoredBbox)) {
      return;
    }

    this.bbox.set(restoredBbox);
    this.bboxCenter.set([
      (restoredBbox.west + restoredBbox.east) / 2,
      (restoredBbox.south + restoredBbox.north) / 2,
    ]);

    this.renderBboxFeature(restoredBbox);
  }

  private areBboxesEqual(a: SpatialBBox, b: SpatialBBox): boolean {
    return a.west === b.west && a.south === b.south && a.east === b.east && a.north === b.north;
  }

  private renderBboxFeature(bbox: SpatialBBox) {
    this.bboxSource.clear();

    const extent3857 = transformExtent(
      [bbox.west, bbox.south, bbox.east, bbox.north],
      'EPSG:4326',
      'EPSG:3857',
    );
    const feature = new Feature(polygonFromExtent(extent3857));
    this.bboxSource.addFeature(feature);
    this.map?.renderSync();
  }

  private syncResultsFeatures() {
    if (!this.map) {
      return;
    }

    this.resultsSource.clear();
    this.resultFeaturesByRecordId.clear();

    const records = this.searchMapOverlayService.getPageResults(this.scope());
    for (const record of records) {
      const recordId = record?.info?._id || record?.uuid;
      if (!recordId) {
        continue;
      }

      const rawGeom = (record as Record<string, unknown>)['geom'];
      const geoms = Array.isArray(rawGeom) ? rawGeom : rawGeom ? [rawGeom] : [];

      const featuresForRecord: Feature<Geometry>[] = [];
      for (const geom of geoms) {
        if (!geom || typeof geom !== 'object') {
          continue;
        }

        try {
          const geometry = this.geoJsonFormat.readGeometry(geom as object, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          });
          const feature = new Feature(geometry);
          feature.setId(`${recordId}-${featuresForRecord.length}`);
          this.resultsSource.addFeature(feature);
          featuresForRecord.push(feature);
        } catch {
          // Ignore malformed geometry entries and continue with remaining records.
        }
      }

      if (featuresForRecord.length > 0) {
        this.resultFeaturesByRecordId.set(recordId, featuresForRecord);
      }
    }

    this.zoomToAllPageFeatures();
    this.syncHoveredFeature();
    this.map.renderSync();
  }

  private zoomToAllPageFeatures() {
    if (!this.map) {
      return;
    }

    const extent = createEmpty();
    for (const features of this.resultFeaturesByRecordId.values()) {
      for (const feature of features) {
        const geometryExtent = feature.getGeometry()?.getExtent();
        if (!geometryExtent) {
          continue;
        }
        extend(extent, geometryExtent);
      }
    }

    if (isEmpty(extent)) {
      return;
    }

    this.map.getView().fit(extent, {
      duration: 250,
      padding: [24, 24, 24, 24],
      maxZoom: 12,
    });
  }

  private syncHoveredFeature() {
    this.hoverSource.clear();

    const hoveredRecordId = this.searchMapOverlayService.getHoveredRecordId(this.scope());
    if (!hoveredRecordId) {
      this.map?.renderSync();
      return;
    }

    const features = this.resultFeaturesByRecordId.get(hoveredRecordId) || [];
    for (const feature of features) {
      this.hoverSource.addFeature(feature.clone());
    }

    this.map?.renderSync();
  }

  private zoomToRecordExtent(recordId: string) {
    if (!this.map) {
      return;
    }

    const features = this.resultFeaturesByRecordId.get(recordId) || [];
    if (features.length === 0) {
      return;
    }

    const extent = createEmpty();
    for (const feature of features) {
      const geometryExtent = feature.getGeometry()?.getExtent();
      if (!geometryExtent) {
        continue;
      }
      extend(extent, geometryExtent);
    }

    if (isEmpty(extent)) {
      return;
    }

    this.map.getView().fit(extent, {
      duration: 250,
      padding: [24, 24, 24, 24],
      maxZoom: 12,
    });
  }

  private removeDrawInteraction() {
    if (this.map && this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
    }
    this.drawInteraction = null;
  }
}
