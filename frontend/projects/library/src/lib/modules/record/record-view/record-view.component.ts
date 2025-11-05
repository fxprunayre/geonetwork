import { Component, effect, inject, input, OnInit, signal, TemplateRef } from '@angular/core';
import { AsyncPipe, DatePipe, JsonPipe, NgTemplateOutlet } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { IndexRecord } from 'gn-api-client';
import { RelatedItemType } from 'gn4-api-client';
import { SearchService } from '../../search/search.service';
import { faImage } from '@ng-icons/font-awesome/regular';
import {
  faSolidCircleExclamation,
  faSolidDownload,
  faSolidShareNodes,
} from '@ng-icons/font-awesome/solid';
import { provideIcons } from '@ng-icons/core';
import { MarkdownPipe } from 'ngx-markdown';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { Fieldset } from 'primeng/fieldset';
import { Panel } from 'primeng/panel';
import { RecordField } from '../record-field/record-field';
import { RecordFieldContact } from '../record-field-contact/record-field-contact';
import { RecordFieldCredit } from '../record-field-credit/record-field-credit';
import { TranslatePipe } from '@ngx-translate/core';
import { RecordDistributionPanel } from '../distributions/record-distribution-panel/record-distribution-panel';
import { RecordViewHeader } from '../record-view-header/record-view-header';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { FeedbackPanel } from '../../feedbacks/feedback-panel/feedback-panel';
import { RecordFieldVocabulary } from '../record-field-vocabulary/record-field-vocabulary';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { Chip } from 'primeng/chip';
import { AssociatedRecordsPanel } from '../associated/associated-records-panel/associated-records-panel';

@Component({
  selector: 'app-record-view',
  templateUrl: './record-view.component.html',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    AccordionModule,
    MarkdownPipe,
    AsyncPipe,
    ShowMoreToggle,
    Fieldset,
    DatePipe,
    Panel,
    RecordField,
    RecordFieldContact,
    RecordFieldCredit,
    TranslatePipe,
    RecordDistributionPanel,
    RecordViewHeader,
    Tabs,
    Tab,
    TabPanels,
    TabPanel,
    TabList,
    FeedbackPanel,
    RecordFieldVocabulary,
    JsonPipe,
    RecordFieldType,
    Chip,
    AssociatedRecordsPanel,
  ],
  viewProviders: [
    provideIcons({
      faImage,
      faSolidDownload,
      faSolidShareNodes,
      faSolidCircleExclamation,
    }),
  ],
})
export class RecordViewComponent {
  uuid = input<string | null>();

  layout = input<'fieldset' | 'panel'>('panel');

  searchService = inject(SearchService);

  backButtonTplRef = input<TemplateRef<unknown>>();

  record = signal<IndexRecord | undefined>(undefined);

  recordStatus = signal<string | undefined>(undefined);

  mainVocabularies = signal(['th_sextant-theme']);

  constructor() {
    effect(() => {
      const uuid = this.uuid();
      if (!uuid) return;

      this.searchService
        .getById(uuid, [
          RelatedItemType.Parent,
          RelatedItemType.Children,
          RelatedItemType.Services,
          RelatedItemType.Sources,
          RelatedItemType.Associated,
        ])
        .subscribe({
          next: (result) => {
            if (result) {
              this.record.set(result);
            } else {
              this.recordStatus.set('not-found-or-not-shared-with-you');
            }
          },
          error: (error) => {
            this.recordStatus.set('not-found-or-not-shared-with-you');
          },
        });
    });
  }

  protected readonly statusbar = statusbar;

  getLineage(): string {
    return (this.record()?.lineageObject as any)?.['default'] ?? '';
  }

  getConstraints(): { default: string; link: string } {
    const constraint = this.record()?.['MD_LegalConstraintsUseLimitationObject']?.[0];
    return {
      default: constraint?.default ?? '',
      link: constraint?.link ?? '',
    };
  }

  getUseConstraint(): { default: string; link: string } {
    const constraint = this.record()?.['cl_useConstraints']?.[0];
    return {
      default: constraint?.default ?? '',
      link: constraint?.link ?? '',
    };
  }

  getOtherConstraint(): { default: string; link: string } {
    const constraint = this.record()?.['MD_LegalConstraintsOtherConstraintsObject']?.[0];
    return {
      default: constraint?.default ?? '',
      link: constraint?.link ?? '',
    };
  }
}
