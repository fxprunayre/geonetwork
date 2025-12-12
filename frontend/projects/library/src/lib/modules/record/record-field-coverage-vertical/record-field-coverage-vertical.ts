import { Component, computed } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronRight } from '@ng-icons/font-awesome/solid';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-coverage-vertical',
  imports: [NgIcon],
  viewProviders: [provideIcons({ faSolidChevronRight })],
  template: `@for (extent of verticalExtents(); track $index) {
    <p>
      {{ extent?.gte }}
      <ng-icon name="faSolidChevronRight" class="mx-2"></ng-icon>
      {{ extent?.lte }}
      @if (extent?.unit) {
        ({{ extent?.unit }})
      }
    </p>
  }`,
})
export class RecordFieldCoverageVertical extends RecordFieldBase {
  verticalExtents = computed(() => {
    return this.record()?.['verticalRange'] || [];
  });
}
