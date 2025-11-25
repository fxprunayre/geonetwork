import { Component, inject } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Link } from 'gn-api-client';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';
import { Router } from '@angular/router';

@Component({
  selector: 'app-record-distribution-panel',
  imports: [KeyValuePipe, Badge, Button],
  templateUrl: './record-distribution-panel.html',
})
export class RecordDistributionPanel extends RecordDistributionFieldBase {
  private router = inject(Router);

  isExplorable = (link: Link) => {
    const url = link.urlObject?.['default'];
    if (url) {
      return url.endsWith('.parquet') || url.endsWith('.json') || url.endsWith('.csv');
    }
    return false;
  };
  exploreData = (link: Link) => {
    // TODO: Not sure how to link actions to routing which is app specific
    this.router.navigate(['record', this.record().uuid, 'explore'], {
      queryParams: { datasource: link.urlObject?.['default'] },
    });
  };
  addWmsLayers = (link: Link[]) => {
    // TODO
  };
}
