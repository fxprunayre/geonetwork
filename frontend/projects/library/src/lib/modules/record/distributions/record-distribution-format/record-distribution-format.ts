import { Component, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from 'primeng/badge';
import { Card } from 'primeng/card';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';

@Component({
  selector: 'app-record-distribution-format',
  imports: [Card, TranslatePipe, Badge],
  template: `
    @if (formats().length > 0) {
      <p-card
        [header]="'record.field.distribution.format' | translate"
        [pt]="{ content: 'flex gap-2' }"
      >
        @for (format of formats(); track $index) {
          <p-badge severity="success" [value]="format"></p-badge>
        }
      </p-card>
    }
  `,
})
export class RecordDistributionFormat extends RecordDistributionFieldBase {
  formats = computed(() => {
    return this.record()?.format?.filter((f: string) => f.trim() !== '') || [];
  });
}
