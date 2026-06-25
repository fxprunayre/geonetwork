import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SearchLink } from '../../search/search-link/search-link';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-credit',
  templateUrl: './record-field-credit.html',
  imports: [NgTemplateOutlet, SearchLink],
})
export class RecordFieldCredit extends RecordFieldBase {
  displayFirstOnly = input<boolean>(false);

  credits = computed<Record<string, string>[] | undefined>(() => {
    return this.record()?.resourceCreditObject;
  });
}
