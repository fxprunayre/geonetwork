import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCloudArrowDown,
  faSolidLink,
  faSolidNetworkWired,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Link } from 'gn-api-client';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { IftaLabel } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { MAP_ROUTE_PATH, RECORD_ROUTE_PATH } from '../../search/search-constant';
import { LinkBadge } from '../link-badge/link-badge';
import { AddLayerToMap } from '../add-layer-to-map/add-layer-to-map';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';

@Component({
  selector: 'app-record-distribution-panel',
  imports: [
    KeyValuePipe,
    Button,
    TranslatePipe,
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    AddLayerToMap,
    InputText,
    IftaLabel,
    LinkBadge,
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
        url.endsWith('.xls') ||
        url.endsWith('.xlsx') ||
        link.protocol === 'OGC:WFS'
      );
    }
    return false;
  };
  exploreData = (link: Link) => {
    // TODO: Not sure how to link actions to routing which is app specific
    this.router.navigate([RECORD_ROUTE_PATH, this.record().uuid, 'explore'], {
      queryParams: { datasource: link.urlObject?.['default'] },
    });
  };
}
