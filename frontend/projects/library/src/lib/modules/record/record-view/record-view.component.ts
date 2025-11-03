import { Component, inject, input, OnInit, signal, TemplateRef } from '@angular/core';
import { AsyncPipe, DatePipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { IndexRecord } from 'gn-api-client';
import { SearchService } from '../../search/search.service';
import { faImage } from '@ng-icons/font-awesome/regular';
import {
  faSolidCircleExclamation,
  faSolidDownload,
  faSolidShareNodes,
} from '@ng-icons/font-awesome/solid';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Card } from 'primeng/card';
import { RecordFieldOverviewComponent } from '../record-field-overview/record-field-overview.component';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { MarkdownPipe } from 'ngx-markdown';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { Fieldset } from 'primeng/fieldset';
import { Panel } from 'primeng/panel';
import { RecordField } from '../record-field/record-field';
import { RecordFieldContact } from '../record-field-contact/record-field-contact';
import { RecordFieldCredit } from '../record-field-credit/record-field-credit';
import { TranslatePipe } from '@ngx-translate/core';
import { RecordDistributionPanel } from '../distributions/record-distribution-panel/record-distribution-panel';

@Component({
  selector: 'app-record-view',
  templateUrl: './record-view.component.html',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    AccordionModule,
    NgIcon,
    ButtonDirective,
    ButtonLabel,
    ButtonIcon,
    Card,
    RecordFieldOverviewComponent,
    RecordFieldType,
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
    KeyValuePipe,
    RecordDistributionPanel,
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
export class RecordViewComponent implements OnInit {
  uuid = input<string | null>();

  layout = input<'fieldset' | 'panel'>('panel');

  searchService = inject(SearchService);

  backButtonTplRef = input<TemplateRef<unknown>>();

  record = signal<IndexRecord | undefined>(undefined);

  recordStatus = signal<string | undefined>(undefined);

  ngOnInit() {
    const uuid = this.uuid();
    if (!uuid) return;

    this.searchService.getById(uuid).subscribe({
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
  }
  protected readonly statusbar = statusbar;

  getOverviewImage(): string | null {
    const overview = this.record()?.overview;
    if (overview && overview.length > 0) {
      if (overview[0].data && overview[0].data.startsWith('data:image')) {
        return overview[0].data;
      }
      if (overview[0].url) {
        return overview[0].url;
      }
    }
    return null;
  }

  getOverviewImageName(): string {
    const overview = this.record()?.overview;
    if (overview && overview.length > 0 && overview[0].nameObject) {
      return overview[0].nameObject['default'] || 'Image';
    }
    return 'Preview Image';
  }

  getAuthors(): any[] {
    const contacts = this.record()?.['contactForResource'] || [];
    return contacts.filter((contact: any) => contact.role === 'author');
  }

  getOrgName(): string {
    return (this.record()?.OrgObject as any)?.['default'] ?? '';
  }

  getContacts(): any[] {
    const contacts = this.record()?.['contact'] || [];
    return contacts.filter((contact: any) => contact.role === 'pointOfContact');
  }

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
