import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ResourceDate } from 'gn-api-client';
import { RecordFieldBase } from '../base';

@Component({
  selector: 'app-record-field-resource-last-update',
  imports: [DatePipe, TranslatePipe],
  template: ` @let lastDate = lastResourceUpdate();
    @if (lastDate) {
      <p [title]="lastDate.type | translate">
        <span>{{ 'record.field.lastUpdated' | translate }}</span>
        {{ lastDate.date | date: 'longDate' : undefined : currentLocale }}
      </p>
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordFieldResourceLastUpdate extends RecordFieldBase implements OnInit {
  currentLocale = '';

  translateService = inject(TranslateService);

  ngOnInit(): void {
    this.currentLocale = this.translateService.getCurrentLang();
  }

  lastResourceUpdate = computed(() => {
    // Return the most recent date in resourceDate array
    return this.record()?.resourceDate?.reduce((latest: ResourceDate, current: ResourceDate) => {
      return (current.date ?? '') > (latest.date ?? '') ? current : latest;
    });
  });
}
