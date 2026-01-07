import { Component, input } from '@angular/core';
import { IndexRecord } from 'gn-api-client';

@Component({
  selector: 'app-record-field-base',
  imports: [],
  template: '',
})
export class RecordFieldBase {
  record = input.required<IndexRecord>();
  withSearchLink = input<boolean>(false);
  class = input<string>();
}
