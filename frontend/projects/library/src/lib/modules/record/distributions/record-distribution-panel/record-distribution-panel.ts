import { Component, inject } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Link } from 'gn-api-client';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';
import { Router } from '@angular/router';

interface Gn4MapCommand {
  url: string;
  name?: string;
}

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
      return (
        url.endsWith('.parquet') ||
        url.endsWith('.json') ||
        url.endsWith('.csv') ||
        link.protocol === 'OGC:WFS'
      );
    }
    return false;
  };
  exploreData = (link: Link) => {
    // TODO: Not sure how to link actions to routing which is app specific
    this.router.navigate(['record', this.record().uuid, 'explore'], {
      queryParams: { datasource: link.urlObject?.['default'] },
    });
  };
  addWmsLayers = (links: Link[]) => {
    const command = links
      .filter((link) => link.urlObject)
      .map((link) => {
        const cmd: Gn4MapCommand = {
          url: encodeURIComponent(link.urlObject!['default']),
        };
        if (link.nameObject) {
          cmd.name = link.nameObject['default'];
        }
        return cmd;
      });
    if (command.length > 0) {
      const commandParameter = 'add=' + JSON.stringify(command);
      window.open(
        `https://sextant.ifremer.fr/geonetwork/srv/fre/catalog.search#/map?${commandParameter}`,
        'map',
      );
    }
  };
}
