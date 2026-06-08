import { Component, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Chip } from 'primeng/chip';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-doi',
  imports: [Chip, TranslatePipe],
  templateUrl: './record-field-doi.html',
})
export class RecordFieldDoi extends RecordFieldBase {
  doi = computed(() => {
    const links = this.record().link;
    if (!links) {
      return undefined;
    }
    return links
      .filter((l) => l.protocol?.toLowerCase().match(/doi|www:link-1.0-http--metadata-url/))
      .map((link) => {
        const url = link.urlObject?.['default'];
        return {
          url: url,
          code: url?.replace('https://doi.org/', ''),
        };
      })[0];
  });
}
