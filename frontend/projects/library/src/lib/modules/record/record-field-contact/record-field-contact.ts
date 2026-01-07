import { Component, computed, inject, input } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe, KeyValuePipe, NgTemplateOutlet } from '@angular/common';
import { RecordField } from '../record-field/record-field';
import { Card } from 'primeng/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidEnvelope,
  faSolidGlobe,
  faSolidLocationDot,
  faSolidPhone,
  faSolidFingerprint,
} from '@ng-icons/font-awesome/solid';
import { faBrandOrcid } from '@ng-icons/font-awesome/brands';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { SearchLink } from '../../search/search-link/search-link';

// TODO: to add to IndexRecord in gn-api-client
export interface OrganisationObject {
  default: string;
  [key: string]: string;
}

export interface ContactIdentifier {
  code: string;
  codeSpace: string;
  link: string;
}

export interface ContactInfo {
  organisationObject: OrganisationObject;
  role: string;
  email: string;
  website: string;
  logo: string;
  individual: string;
  position: string;
  phone: string;
  address: string;
  identifiers?: ContactIdentifier[];
}

@Component({
  selector: 'app-record-field-contact',
  imports: [TranslatePipe, KeyValuePipe, RecordField, NgTemplateOutlet, Card, NgIcon, SearchLink],
  viewProviders: [
    provideIcons({
      faSolidEnvelope,
      faSolidGlobe,
      faSolidLocationDot,
      faSolidPhone,
      faSolidFingerprint,
      faBrandOrcid,
    }),
  ],
  templateUrl: './record-field-contact.html',
})
export class RecordFieldContact extends RecordFieldBase {
  role = input<string>();

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  contacts = computed<ContactInfo[]>(() => {
    return this.record()?.['contactForResource'];
  });

  getHarvestingLogoUrl(contact: ContactInfo): string | undefined {
    if (!this.catalogueUrl || !contact.email) return undefined;
    const emailParts = contact.email.split('@');
    if (emailParts.length !== 2) return undefined;
    const domain = emailParts[1];
    return `${this.catalogueUrl}/images/harvesting/${domain}.png`;
  }

  hideImage(event: Event) {
    (event.target as HTMLElement).style.display = 'none';
  }

  contactsByRole = computed(() => {
    const contactsByRole: Record<string, ContactInfo[]> = {};
    const roleFilter = this.role();
    for (const c of this.contacts() ?? []) {
      if (c.role && (!roleFilter || c.role === roleFilter)) {
        if (!contactsByRole[c.role]) {
          contactsByRole[c.role] = [];
        }
        contactsByRole[c.role].push(c);
      }
    }
    return contactsByRole;
  });
}
