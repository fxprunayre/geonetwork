import { Component, computed, input } from '@angular/core';
import { RecordFieldBase } from '../base';

@Component({
  selector: 'app-record-field-constraints',
  imports: [],
  templateUrl: 'record-field-constraints.html',
})
export class RecordFieldConstraints extends RecordFieldBase {
  type = input<
    'MD_LegalConstraintsUseLimitationObject' | 'MD_LegalConstraintsOtherConstraintsObject'
  >('MD_LegalConstraintsUseLimitationObject');

  constraints = computed<{ default: string; link: string }[]>(() => {
    return this.record()?.[this.type()] || [];
  });
}
