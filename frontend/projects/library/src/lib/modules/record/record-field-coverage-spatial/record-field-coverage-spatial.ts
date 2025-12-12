import { Component, computed, inject } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordFieldCoverageCoordinate } from '../record-field-coverage-coordinate/record-field-coverage-coordinate';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-record-field-coverage-spatial',
  imports: [RecordFieldCoverageCoordinate],
  template: `
    @for (bbox of geoms(); track $index) {
      @if (bbox) {
        <div class="relative w-3/5 mx-auto m-12">
          <img
            [src]="overviewUrl()"
            [alt]="altText()"
            [title]="altText()"
            class="w-full rounded border border-gray-200 shadow-sm"
          />

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
  `,
})
export class RecordFieldCoverageSpatial extends RecordFieldBase {
  translateService = inject(TranslateService);

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  overviewBaseUrl = computed(
    () =>
      this.appConfiguration().catalogueUrl + '/srv/api/regions/geom.png?geomsrs=EPSG:4326&geom=',
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
    const geometries = this.record()?.geom;
    if (!geometries) {
      return [];
    }
    return (
      geometries
        .map((geom: any) => {
          const coordinates = geom?.['coordinates'];
          if (coordinates && Array.isArray(coordinates) && coordinates.length > 0) {
            const ring = coordinates[0];
            if (Array.isArray(ring) && ring.length > 0) {
              const lats = ring.map((c: any) => c[1]);
              const lons = ring.map((c: any) => c[0]);

              return {
                north: Math.max(...lats),
                south: Math.min(...lats),
                east: Math.max(...lons),
                west: Math.min(...lons),
                wkt: this.convertGeomToWKT(coordinates[0]),
                geom: geom,
              };
            }
          }
          return undefined;
        })
        .filter((g: any) => g !== undefined) || []
    );
  });

  overviewUrl = computed(() => {
    return `${this.overviewBaseUrl()}${this.geoms()[0]?.wkt}`;
  });

  geometryCollection = computed(() => {
    const wktGeoms = this.geoms().map((g: any) => g.wkt);
    return `GEOMETRYCOLLECTION(${wktGeoms.join(',')})`;
  });

  geometryCollectionUrl = computed(() => {
    return `${this.overviewBaseUrl()}${this.geometryCollection()}`;
  });

  convertGeomToWKT(ring: any[]): string {
    const points = ring.map((coord: any) => `${coord[0]} ${coord[1]}`);
    // Ensure the polygon is closed by repeating the first point at the end
    if (points[0] !== points[points.length - 1]) {
      points.push(points[0]);
    }
    return `POLYGON((${points.join(', ')}))`;
  }
}
