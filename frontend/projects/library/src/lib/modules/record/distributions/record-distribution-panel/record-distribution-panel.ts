import { Component, inject, computed } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Link } from 'gn-api-client';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Card } from 'primeng/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCloudArrowDown,
  faSolidLink,
  faSolidNetworkWired,
} from '@ng-icons/font-awesome/solid';

interface Gn4MapCommand {
  url: string;
  name?: string;
}

@Component({
  selector: 'app-record-distribution-panel',
  imports: [
    KeyValuePipe,
    Badge,
    Button,
    TranslatePipe,
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    Card,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      faSolidCloudArrowDown,
      faSolidLink,
      faSolidNetworkWired,
    }),
  ],
  templateUrl: './record-distribution-panel.html',
})
export class RecordDistributionPanel extends RecordDistributionFieldBase {
  private router = inject(Router);

  activePanels = computed(() => {
    const sections = this.linksBySections();
    if (!sections) return [];
    return Array.from({ length: Object.keys(sections).length }, (_, i) => i);
  });

  get iconsByType() {
    return this.distributionService.iconsByType;
  }

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
