import { Component, computed } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { Chip } from 'primeng/chip';

@Component({
  selector: 'app-record-field-doi',
  imports: [Chip],
  templateUrl: './record-field-doi.html',
})
export class RecordFieldDoi extends RecordFieldBase {
  doi = computed(() => {
    const links = this.record().link;
    console.log('DOI links:', links);
    if (!links) {
      return undefined;
    }
    return links
      .filter((l) => l.protocol?.toLowerCase() === 'doi')
      .map((link) => {
        const url = link.urlObject?.['default'];
        return {
          url: url,
          code: url?.replace('https://doi.org/', ''),
        };
      })[0];
  });
}
