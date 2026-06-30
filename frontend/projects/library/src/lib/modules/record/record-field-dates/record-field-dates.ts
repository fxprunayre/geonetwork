import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faLightbulb, faPaperPlane } from '@ng-icons/font-awesome/regular';
import {
  faSolidArrowRightToBracket,
  faSolidBan,
  faSolidBullhorn,
  faSolidCheck,
  faSolidChevronLeft,
  faSolidChevronRight,
  faSolidEllipsis,
  faSolidPen,
  faSolidShareNodes,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import { ResourceDate } from 'gn-api-client';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-dates',
  imports: [DatePipe],
  viewProviders: [
    provideIcons({
      faLightbulb,
      faPaperPlane,
      faSolidArrowRightToBracket,
      faSolidBan,
      faSolidBullhorn,
      faSolidCheck,
      faSolidChevronLeft,
      faSolidChevronRight,
      faSolidEllipsis,
      faSolidPen,
      faSolidShareNodes,
      faSolidXmark,
    }),
  ],
  templateUrl: './record-field-dates.html',
  styles: [
    `
      p-timeline ::ng-deep .p-timeline-event-opposite {
        display: none;
      }
    `,
  ],
})
export class RecordFieldDates extends RecordFieldBase implements OnInit {
  currentLocale = '';

  translateService = inject(TranslateService);

  ngOnInit(): void {
    this.currentLocale = this.translateService.getCurrentLang();
  }

  icons: Record<string, unknown> = {
    creation: faLightbulb,
    publication: faSolidBullhorn,
    revision: faSolidPen,
    expiry: faSolidXmark,
    lastUpdate: faSolidCheck,
    lastRevision: faSolidCheck,
    nextUpdate: faSolidEllipsis,
    unavailable: faSolidBan,
    inForce: faSolidCheck,
    adopted: faSolidCheck,
    deprecated: faSolidXmark,
    superseded: faSolidArrowRightToBracket,
    validityBegins: faSolidChevronRight,
    validityExpires: faSolidChevronLeft,
    released: faPaperPlane,
    distribution: faSolidShareNodes,
  };

  events = computed<{ icon?: unknown; color: string; date?: string; label: string }[]>(() => {
    const dates = this.record()?.resourceDate || [];
    return dates.map((date: ResourceDate) => {
      return {
        icon: this.icons[date.type || ''],
        color: 'border-surface-200',
        date: date.date,
        label: this.translateService.instant(date.type || ''),
      };
    });
  });
}
