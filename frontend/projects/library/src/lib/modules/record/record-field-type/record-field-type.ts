import { Component, input } from '@angular/core';

@Component({
  selector: 'app-record-field-type',
  imports: [],
  standalone: true,
  templateUrl: './record-field-type.html',
})
export class RecordFieldType {
  resourceType = input<string[] | undefined>([], { alias: 'field' });
}
