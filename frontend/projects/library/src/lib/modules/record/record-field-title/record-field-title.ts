import { Component, computed } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-title',
  imports: [],
  templateUrl: './record-field-title.html',
})
export class RecordFieldTitle extends RecordFieldBase {
  title = computed(() => {
    return this.record()?.resourceTitleObject?.['default'] ?? '-- Missing title --';
  });
}
