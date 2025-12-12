import { Component, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronRight } from '@ng-icons/font-awesome/solid';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-coverage-temporal',
  imports: [NgIcon],
  viewProviders: [provideIcons({ faSolidChevronRight })],
  template: `@for (extent of temporalExtents(); track $index) {
    <p>
      {{ extent.start?.date }}
      <ng-icon name="faSolidChevronRight" class="mx-2"></ng-icon>
      {{ extent.end?.date }}
    </p>
  }`,
})
export class RecordFieldCoverageTemporal extends RecordFieldBase {
  temporalExtents = computed(() => {
    return this.record()?.resourceTemporalExtentDetails || [];
  });
}
