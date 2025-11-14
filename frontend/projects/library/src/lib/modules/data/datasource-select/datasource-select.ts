import { Component, computed, input, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

import { IndexRecord, Link } from 'gn-api-client';

export interface Datasource {
  url: string;
  format: 'csv' | 'parquet' | 'json' | 'geojson' | 'gml' | 'wfs' | 'arrow';
}

@Component({
  selector: 'app-datasource-select',
  imports: [ReactiveFormsModule, Select, FormsModule],
  templateUrl: './datasource-select.html',
})
export class DatasourceSelect {
  record = input<IndexRecord>();

  datasource = model<Datasource | undefined>();

  datasources = computed(() => {
    const supportedLinks: Datasource[] = [];
    const record = this.record();
    if (!record) return supportedLinks;

    record.link?.forEach((link: Link) => {
      const url = link.urlObject?.['default'] || '';
      const protocol = link.protocol || '';
      const extension = url.split('.').pop()?.toLowerCase();
      if (protocol.startsWith('WWW:DOWNLOAD') && extension === 'arrow') {
        supportedLinks.push({ url: url, format: 'arrow' });
      } else if (protocol.startsWith('WWW:DOWNLOAD') && extension === 'parquet') {
        supportedLinks.push({ url: url, format: 'parquet' });
      } else if (protocol.startsWith('WWW:DOWNLOAD') && extension === 'csv') {
        supportedLinks.push({ url: url, format: 'csv' });
      } else if (
        protocol.startsWith('WWW:DOWNLOAD') &&
        (extension === 'json' || url.indexOf('f=pjson') != -1)
      ) {
        supportedLinks.push({ url: url, format: 'json' });
      } else if (protocol.startsWith('WWW:DOWNLOAD') && extension === 'gml') {
        supportedLinks.push({ url: url, format: 'gml' });
      }
    });

    return supportedLinks;
  });
}
