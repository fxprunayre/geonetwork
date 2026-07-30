import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { createMapFromContext } from '@geospatial-sdk/openlayers';
import { TranslateService } from '@ngx-translate/core';
import type Feature from 'ol/Feature';
import GeoJSON, {
  type GeoJSONFeature,
  type GeoJSONFeatureCollection,
  type GeoJSONGeometry,
} from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import type Geometry from 'ol/geom/Geometry';
import GeometryCollection from 'ol/geom/GeometryCollection';
import { transformExtent } from 'ol/proj';
import Style from 'ol/style/Style';
import { createThemeAwareVectorLayerStyle } from '../../../shared/map-layer-style';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_MAP_CONTEXT, DEFAULT_SPACE } from '../../config/gn-constants';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { RecordFieldCoverageCoordinate } from '../record-field-coverage-coordinate/record-field-coverage-coordinate';

interface SpatialBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  wkt: string;
  geom: GeoJSONGeometry;
}

@Component({
  selector: 'app-record-field-coverage-spatial',
  imports: [RecordFieldCoverageCoordinate],
  encapsulation: ViewEncapsulation.None,
  styles: `
    @import 'ol/ol.css';
    app-record-field-coverage-spatial .ol-control button {
      background-color: var(--p-primary-500, #093564);
      color: white;
    }
    app-record-field-coverage-spatial .ol-control button:hover,
    app-record-field-coverage-spatial .ol-control button:focus {
      background-color: var(--p-primary-600, #082d55);
    }
  `,
  template: `
    <div class="flex flex-col gap-2">
      @for (bbox of displayedGeoms(); track $index) {
        @if (bbox) {
          <div class="relative w-4/5 mx-auto m-8">
            @if (
              appConfiguration().config?.apps?.record?.coverageSpatialDisplayType === 'dynamicMap'
            ) {
              <div
                class="w-full h-75 bg-slate-100 rounded border border-gray-200 shadow-sm"
                #map
              ></div>
            } @else {
              <img
                [src]="overviewUrl(bbox.wkt)"
                [alt]="altText()"
                [title]="altText()"
                class="w-full rounded border border-gray-200 shadow-sm"
              />
            }

            <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <app-record-field-coverage-coordinate
                [value]="bbox.north"
                label="record.field.coverage.north"
                class="block w-32"
              ></app-record-field-coverage-coordinate>
            </div>

            <div class="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
              <app-record-field-coverage-coordinate
                [value]="bbox.west"
                label="record.field.coverage.west"
                class="block w-32"
              ></app-record-field-coverage-coordinate>
            </div>

            <div class="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
              <app-record-field-coverage-coordinate
                [value]="bbox.east"
                label="record.field.coverage.east"
                class="block w-32"
              ></app-record-field-coverage-coordinate>
            </div>

            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <app-record-field-coverage-coordinate
                [value]="bbox.south"
                label="record.field.coverage.south"
                class="block w-32"
              ></app-record-field-coverage-coordinate>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class RecordFieldCoverageSpatial extends RecordFieldBase implements AfterViewInit {
  allGeomsInOneMap = input(true);

  geoJsonFormat = new GeoJSON();

  wktFormat = new WKT();

  translateService = inject(TranslateService);

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  overviewBaseUrl = computed(
    () =>
      `${this.appConfiguration().catalogueUrl}/${DEFAULT_SPACE}/api/regions/geom.png?geomsrs=EPSG:4326&geom=`,
  );

  extentDescription = computed(() => {
    return this.record()?.['extentDescription'] || [];
  });

  altText = computed(() => {
    if (this.extentDescription().length > 0) {
      return this.extentDescription().join('; ');
    }
    return this.translateService.instant('record.field.coverage.overviewAltText');
  });

  extentIdentifier = computed(() => {
    return this.record()?.['extentIdentifier'] || [];
  });

  geoms = computed(() => {
    const shapes = this.toArray(this.record()?.shape);
    if (shapes.length > 0) {
      const shapeGeometries =
        shapes
          .map((shape: GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONGeometry) =>
            this.getShapeBoundsAndWkt(shape),
          )
          .filter((g: SpatialBounds | undefined) => g !== undefined) || [];
      if (shapeGeometries.length > 0) {
        return shapeGeometries;
      }
    }

    const geometries = this.toArray(this.record()?.geom);
    if (geometries.length === 0) {
      return [];
    }

    return (
      geometries
        .map((geom: GeoJSONGeometry) => {
          return this.getGeomBoundsAndWkt(geom);
        })
        .filter((g: SpatialBounds | undefined) => g !== undefined) || []
    );
  });

  toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }

  overviewUrl(wkt: string): string {
    return `${this.overviewBaseUrl()}${wkt}`;
  }

  geometryCollection = computed(() => {
    const wktGeoms = this.geoms().map((g: SpatialBounds) => g.wkt);
    return `GEOMETRYCOLLECTION(${wktGeoms.join(',')})`;
  });

  geometryCollectionUrl = computed(() => {
    return `${this.overviewBaseUrl()}${this.geometryCollection()}`;
  });

  displayedGeoms = computed(() => {
    const geometries = this.geoms();
    if (geometries.length === 0) {
      return [];
    }
    if (!this.allGeomsInOneMap()) {
      return geometries;
    }

    return [
      {
        north: Math.max(...geometries.map((g: SpatialBounds) => g.north)),
        south: Math.min(...geometries.map((g: SpatialBounds) => g.south)),
        east: Math.max(...geometries.map((g: SpatialBounds) => g.east)),
        west: Math.min(...geometries.map((g: SpatialBounds) => g.west)),
        wkt: this.geometryCollection(),
        geom: {
          type: 'GeometryCollection',
          geometries: geometries.map((g: SpatialBounds) => g.geom),
        },
      },
    ];
  });

  convertGeomToWKT(ring: number[][]): string {
    const points = ring.map((coord: number[]) => `${coord[0]} ${coord[1]}`);
    // Ensure the polygon is closed by repeating the first point at the end
    if (points[0] !== points[points.length - 1]) {
      points.push(points[0]);
    }
    return `POLYGON((${points.join(', ')}))`;
  }

  getGeomBoundsAndWkt(geom: GeoJSONGeometry): SpatialBounds | undefined {
    if (!geom || !geom.type) {
      return undefined;
    }

    if (geom.type === 'Point') {
      const coordinates = geom?.coordinates;
      if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        typeof coordinates[0] !== 'number' ||
        typeof coordinates[1] !== 'number'
      ) {
        return undefined;
      }

      const lon = coordinates[0];
      const lat = coordinates[1];
      return {
        north: lat,
        south: lat,
        east: lon,
        west: lon,
        wkt: `POINT(${lon} ${lat})`,
        geom,
      };
    }

    if (geom.type === 'Polygon') {
      const coordinates = geom?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        return undefined;
      }

      const ring = coordinates[0];
      if (!Array.isArray(ring) || ring.length === 0) {
        return undefined;
      }

      const lats = ring.map((c: number[]) => c[1]);
      const lons = ring.map((c: number[]) => c[0]);

      return {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lons),
        west: Math.min(...lons),
        wkt: this.convertGeomToWKT(ring),
        geom,
      };
    }

    return undefined;
  }

  getShapeBoundsAndWkt(
    shapeGeoJson: GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONGeometry,
  ): SpatialBounds | undefined {
    const geometry = this.readShapeGeometry(shapeGeoJson);
    if (!geometry) {
      return undefined;
    }

    const [west, south, east, north] = geometry.getExtent();
    return {
      north,
      south,
      east,
      west,
      wkt: this.wktFormat.writeGeometry(geometry),
      geom: this.geoJsonFormat.writeGeometryObject(geometry),
    };
  }

  readShapeGeometry(
    shape: GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONGeometry,
  ): Geometry | undefined {
    if (!shape || typeof shape !== 'object') {
      return undefined;
    }

    if (shape.type === 'Feature') {
      try {
        const featureOrFeatures = this.geoJsonFormat.readFeature(shape);
        const feature = Array.isArray(featureOrFeatures) ? featureOrFeatures[0] : featureOrFeatures;
        return feature?.getGeometry?.();
      } catch {
        return undefined;
      }
    }

    if (shape.type === 'FeatureCollection') {
      try {
        const geometries = this.geoJsonFormat
          .readFeatures(shape)
          .map((feature: Feature<Geometry>) => feature.getGeometry())
          .filter((geometry: Geometry | undefined): geometry is Geometry => !!geometry);

        if (geometries.length === 0) {
          return undefined;
        }
        if (geometries.length === 1) {
          return geometries[0];
        }
        return new GeometryCollection(geometries);
      } catch {
        return undefined;
      }
    }

    if (shape.type) {
      try {
        return this.geoJsonFormat.readGeometry(shape);
      } catch {
        return undefined;
      }
    }

    return undefined;
  }

  maps = viewChildren<ElementRef<HTMLDivElement>>('map');

  ngAfterViewInit() {
    const mapElements = this.maps();

    this.displayedGeoms().forEach((bbox: SpatialBounds, index: number) => {
      const mapElement = mapElements[index]?.nativeElement;
      if (mapElement) {
        // Deep clone so multiple bbox maps on the same page don't append to a single reference
        const mapContext = JSON.parse(JSON.stringify(DEFAULT_MAP_CONTEXT));
        mapContext.layers.push({
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: bbox.geom,
              },
            ],
          },
        });
        const map = createMapFromContext(mapContext, mapElement);

        setTimeout(() => {
          map.updateSize();

          const layers = map.getLayers().getArray();
          const geojsonLayer: unknown = layers[layers.length - 1];
          if (
            geojsonLayer &&
            typeof geojsonLayer === 'object' &&
            'setStyle' in geojsonLayer &&
            typeof (geojsonLayer as Record<string, unknown>)['setStyle'] === 'function'
          ) {
            (geojsonLayer as { setStyle: (style: Style) => void }).setStyle(
              createThemeAwareVectorLayerStyle({
                strokeColorVarNames: ['--p-primary-900'],
                fillColorVarNames: ['--p-primary-500', '--p-primary-color'],
                fillAlpha: 0.5,
                strokeWidth: 2,
                markerRadius: 6,
                markerStrokeWidth: 2,
              }),
            );
          }

          const hasCollapsedExtent = bbox.west === bbox.east && bbox.south === bbox.north;
          const fitExtent = hasCollapsedExtent
            ? [bbox.west - 0.1, bbox.south - 0.1, bbox.east + 0.1, bbox.north + 0.1]
            : [bbox.west, bbox.south, bbox.east, bbox.north];

          const extentIn3857 = transformExtent(fitExtent, 'EPSG:4326', 'EPSG:3857');

          map.getView().fit(extentIn3857, { padding: [10, 10, 10, 10], maxZoom: 12 });
        }, 100);
      }
    });
  }
}
