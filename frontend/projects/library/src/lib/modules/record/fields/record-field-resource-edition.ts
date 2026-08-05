import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RecordFieldBase } from '../base';

@Component({
  selector: 'app-record-field-resource-edition',
  imports: [TranslatePipe],
  template: ` @if (resourceEdition()) {
    <p>
      <span>{{ 'record.field.edition' | translate }}</span>
      {{ resourceEdition() }}
    </p>
  }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordFieldResourceEdition extends RecordFieldBase {
  resourceEdition = computed(() => this.record()?.resourceEdition?.trim() || '');
}
