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
        [pt]="{ content: 'flex flex-col items-center gap-2' }"
      >
        @for (format of formats(); track $index) {
          <p-badge
            severity="success"
            [value]="format"
            class="line-clamp-1"
            [title]="format"
          ></p-badge>
        }
      </p-card>
    }
  `,
})
export class RecordDistributionFormat extends RecordDistributionFieldBase {
  formats = computed(() => {
    const serviceTypeValue = this.record()?.serviceType || [];
    const serviceTypes: string[] =
      serviceTypeValue instanceof Array ? serviceTypeValue : [serviceTypeValue || ''];

    const formats = this.record()?.format || [];
    return [...new Set([...serviceTypes, ...formats].filter((f: string) => f && f.trim() !== ''))];
  });
}
