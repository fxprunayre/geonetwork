import { Component, computed } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValuePipe } from '@angular/common';
import { DateComponent } from '../../../shared/widgets/date-parser/date-parser';

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
  imports: [TranslatePipe, KeyValuePipe, DateComponent],
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
