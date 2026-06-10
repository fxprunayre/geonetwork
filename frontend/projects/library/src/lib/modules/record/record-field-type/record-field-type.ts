import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidChartColumn,
  faSolidChevronRight,
  faSolidCloud,
  faSolidCopy,
  faSolidCube,
  faSolidDatabase,
  faSolidMap,
  faSolidTable,
  faSolidTableCellsLarge,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Chip } from 'primeng/chip';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-type',
  imports: [Chip, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidChevronRight,
      faSolidDatabase,
      faSolidMap,
      faSolidTable,
      faSolidCopy,
      faSolidCloud,
      faSolidChartColumn,
      faSolidBook,
      faSolidCube,
      faSolidTableCellsLarge,
    }),
  ],
  standalone: true,
  templateUrl: './record-field-type.html',
})
export class RecordFieldType extends RecordFieldBase {
  withSpatialType = input<boolean>(false);
  mainTypeOnly = input<boolean>(false);

  private readonly resourceTypeIconMap: Record<string, string> = {
    dataset: 'faSolidDatabase',
    map: 'faSolidMap',
    featureCatalog: 'faSolidTable',
    document: 'faSolidCopy',
    service: 'faSolidCloud',
    series: 'faSolidCopy',
    nonGeographicDataset: 'faSolidChartColumn',
    publication: 'faSolidBook',
  };

  private readonly spatialTypeIconMap: Record<string, string> = {
    vector: 'faSolidMap',
    grid: 'faSolidTableCellsLarge',
    textTable: 'faSolidTable',
    tin: 'faSolidCube',
    video: 'faSolidCloud',
    stereoModel: 'faSolidCube',
  };

  selectedResourceType = computed(() => {
    const types = this.record().resourceType || [];
    return this.mainTypeOnly() ? [types[0]] : types;
  });

  getResourceTypeIcon(type: string): string {
    return this.resourceTypeIconMap[type] || 'faSolidDatabase';
  }

  getSpatialTypeIcon(type: string): string {
    return this.spatialTypeIconMap[type] || 'faSolidTable';
  }
}
