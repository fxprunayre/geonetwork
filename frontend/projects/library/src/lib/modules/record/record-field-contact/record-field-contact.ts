import { Component, computed } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { Card } from 'primeng/card';
import { TranslatePipe } from '@ngx-translate/core';
import { Popover } from 'primeng/popover';
import { Avatar } from 'primeng/avatar';
import { KeyValuePipe } from '@angular/common';

// TODO: to add to IndexRecord in gn-api-client
export interface OrganisationObject {
  default: string;
  [key: string]: string;
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
}

@Component({
  selector: 'app-record-field-contact',
  imports: [Card, TranslatePipe, Popover, Avatar, KeyValuePipe],
  templateUrl: './record-field-contact.html',
})
export class RecordFieldContact extends RecordFieldBase {
  contacts = computed<ContactInfo[]>(() => {
    return this.record()?.['contactForResource'];
  });

  contactsByRole = computed(() => {
    const contactsByRole: Record<string, ContactInfo[]> = {};
    for (const c of this.contacts() ?? []) {
      if (c.role) {
        if (!contactsByRole[c.role]) {
          contactsByRole[c.role] = [];
        }
        contactsByRole[c.role].push(c);
      }
    }
    return contactsByRole;
  });
}
