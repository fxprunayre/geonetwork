import { Component, computed, input } from '@angular/core';
import { RecordFieldBase } from '../base';

@Component({
  selector: 'app-record-field-constraints',
  imports: [],
  template: `
    @for (constraint of constraints(); track $index) {
      <p class="leading-relaxed">
        @if (constraint.link) {
          <a [href]="constraint.link" target="_blank">{{ constraint.default }}</a>
        } @else {
          {{ constraint.default }}
        }
      </p>
    }
  `,
})
export class RecordFieldConstraints extends RecordFieldBase {
  type = input<
    'MD_LegalConstraintsUseLimitationObject' | 'MD_LegalConstraintsOtherConstraintsObject'
  >('MD_LegalConstraintsUseLimitationObject');

  constraints = computed<{ default: string; link: string }[]>(() => {
    return this.record()?.[this.type()] || [];
  });
}
