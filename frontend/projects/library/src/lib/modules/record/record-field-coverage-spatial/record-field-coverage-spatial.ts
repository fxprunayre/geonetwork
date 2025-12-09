import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-coverage-spatial',
  imports: [InputNumber, FormsModule],
  template: `
    @for (bbox of geoms(); track $index) {
      @if (bbox) {
        <div class="grid grid-cols-3 gap-1 text-sm w-fit mx-auto my-2">
          <div class="col-start-2">
            <p-inputnumber
              [ngModel]="bbox.north"
              [mode]="'decimal'"
              fluid="true"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              suffix="°"
              [disabled]="true"
            ></p-inputnumber>
          </div>
          <div class="col-start-1 row-start-2">
            <p-inputnumber
              [ngModel]="bbox.west"
              [mode]="'decimal'"
              fluid="true"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              suffix="°"
              [disabled]="true"
            ></p-inputnumber>
          </div>
          <div class="col-start-3 row-start-2">
            <p-inputnumber
              [ngModel]="bbox.east"
              [mode]="'decimal'"
              fluid="true"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              suffix="°"
              [disabled]="true"
            ></p-inputnumber>
          </div>
          <div class="col-start-2 row-start-3">
            <p-inputnumber
              [ngModel]="bbox.south"
              [mode]="'decimal'"
              fluid="true"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
              suffix="°"
              [disabled]="true"
            ></p-inputnumber>
          </div>
        </div>
      }
    }
  `,
})
export class RecordFieldCoverageSpatial extends RecordFieldBase {
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
              };
            }
          }
          return undefined;
        })
        .filter((g: any) => g !== undefined) || []
    );
  });
}
