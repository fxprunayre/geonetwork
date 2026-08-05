import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidCalendarDays,
  faSolidChevronRight,
  faSolidClock,
  faSolidInfinity,
} from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import { DateRangeDetailsInfo } from 'gn-api-client';
import { RecordFieldBase } from '../base';

@Component({
  selector: 'app-record-field-coverage-temporal',
  imports: [DatePipe],
  viewProviders: [
    provideIcons({
      faSolidChevronRight,
      faSolidCalendarDays,
      faSolidClock,
      faSolidInfinity,
    }),
  ],
  template: `
    <div class="flex flex-col gap-3 pl-2">
      @for (extent of processedExtents(); track $index) {
        <div class="flex items-center gap-3 text-sm">
          <span [class.font-bold]="extent.isYearly">
            @if (extent.start.isDate) {
              {{
                extent.start.label
                  | date: (extent.start.hasTime ? 'medium' : 'longDate') : undefined : currentLang
              }}
            } @else {
              {{ extent.start.label }}
            }
          </span>
          <div class="h-px w-8 bg-surface-300 dark:bg-surface-600"></div>
          <span [class.font-bold]="extent.isYearly">
            @if (extent.end.isDate) {
              {{
                extent.end.label
                  | date: (extent.end.hasTime ? 'medium' : 'longDate') : undefined : currentLang
              }}
            } @else {
              {{ extent.end.label }}
            }
          </span>
        </div>
      }
    </div>
  `,
})
export class RecordFieldCoverageTemporal extends RecordFieldBase {
  translate = inject(TranslateService);
  currentLang = this.translate.getCurrentLang();

  temporalExtents = computed(() => {
    return this.record()?.resourceTemporalExtentDetails || [];
  });

  processedExtents = computed(() => {
    return this.temporalExtents().map((extent) => {
      const start = this.formatDate(extent.start);
      const end = this.formatDate(extent.end);
      const isYearly = start.isYearly && end.isYearly;

      return {
        start,
        end,
        isYearly,
      };
    });
  });

  private formatDate(dateInfo: DateRangeDetailsInfo | undefined) {
    if (!dateInfo) return { label: '?', isYearly: false, isDate: false, hasTime: false };

    if (dateInfo.indeterminatePosition) {
      if (dateInfo.indeterminatePosition === 'now') {
        return {
          label: this.translate.instant('now'),
          isYearly: false,
          isDate: false,
          hasTime: false,
        };
      }
      return {
        label: dateInfo.indeterminatePosition,
        isYearly: false,
        isDate: false,
        hasTime: false,
      };
    }

    if (dateInfo.date) {
      if (dateInfo.date.match('-01-01(T00:00:00)?$')) {
        return {
          label: dateInfo.date.substring(0, 4),
          isYearly: true,
          isDate: false,
          hasTime: false,
        };
      }
      if (dateInfo.date.match('-12-31(T00:00:00)?$')) {
        return {
          label: dateInfo.date.substring(0, 4),
          isYearly: true,
          isDate: false,
          hasTime: false,
        };
      }
      const hasTime =
        dateInfo.date.includes('T') &&
        !/T00:00:00(\.0+)?(Z|[+-]\d{2}:?\d{2})?$/.test(dateInfo.date);
      return { label: dateInfo.date, isYearly: false, isDate: true, hasTime };
    }

    return { label: '?', isYearly: false, isDate: false, hasTime: false };
  }
}
