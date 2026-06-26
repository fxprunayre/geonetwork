import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Message } from 'primeng/message';
import { AssociationLabelPipe } from '../association-label.pipe';

@Component({
  selector: 'app-associated-records-summary',
  template: `
    @if (hasRelatedRecords()) {
      <p-message severity="warn">
        <div class="flex flex-col gap-2">
          <div>{{ 'record.action.relatedRecordsWarning' | translate }}</div>
          <ul class="list-disc list-inside">
            @for (item of relatedRecordsSummary(); track item.type) {
              <li class="font-bold mb-2">{{ item.type | associationLabel: item.count }}</li>
              <ul class="list-none pl-4 space-y-1 mb-4">
                @for (rec of item.records; track $index) {
                  <li class="font-normal text-sm">{{ getTitle(rec) }}</li>
                }
              </ul>
            }
          </ul>
        </div>
      </p-message>
    }
  `,
  standalone: true,
  imports: [Message, TranslatePipe, AssociationLabelPipe],
})
export class AssociatedRecordsSummary {
  record = input.required<Record<string, unknown>>();

  hasRelatedRecords = computed(() => {
    return this.relatedRecordsSummary().length > 0;
  });

  getTitle(record: Record<string, unknown>): string {
    return (
      (record['resourceTitleObject'] as Record<string, string>)?.['default'] ||
      (record['uuid'] as string)
    );
  }

  relatedRecordsSummary = computed(() => {
    const related = this.record()['related'] as
      | Record<string, Record<string, unknown>[]>
      | undefined;
    const summary: { type: string; count: number; records: Record<string, unknown>[] }[] = [];
    if (!related) {
      return summary;
    }

    Object.keys(related).forEach((key) => {
      const records = related[key];
      if (Array.isArray(records) && records.length > 0) {
        summary.push({ type: key, count: records.length, records: records });
      }
    });

    return summary;
  });
}
