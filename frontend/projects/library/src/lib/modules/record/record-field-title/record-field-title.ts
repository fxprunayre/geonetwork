import { Component, computed } from '@angular/core';
import { RecordFieldBase } from '../base';

@Component({
  selector: 'app-record-field-title',
  imports: [],
  template: `
    <span [title]="title()" [class]="class()">
      {{ title() }}
    </span>
  `,
})
export class RecordFieldTitle extends RecordFieldBase {
  title = computed(() => {
    return this.record()?.resourceTitleObject?.['default'] ?? '-- Missing title --';
  });
}
