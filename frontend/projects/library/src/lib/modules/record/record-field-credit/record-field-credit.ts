import { Component, computed, input } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-credit',
  templateUrl: './record-field-credit.html',
})
export class RecordFieldCredit extends RecordFieldBase {
  displayFirstOnly = input<boolean>(false);

  credits = computed<Array<{ [key: string]: string }> | undefined>(() => {
    return this.record()?.resourceCreditObject;
  });
}
