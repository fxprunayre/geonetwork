import { KeyValuePipe, NgTemplateOutlet } from '@angular/common';
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
import { CopyInput } from '../../shared/widgets/copy-input/copy-input';
import { RECORD_ROUTE_PATH } from '../search/search-constant';
import { AddAllLayersToMap } from './add-all-layers-to-map';
import { AddLayerToMap } from './add-layer-to-map';
import { DownloadData } from './download-data';
import { LinkBadge } from './link-badge';
import { RecordDistributionFieldBase } from './record-distribution-field-base';

@Component({
  selector: 'app-record-distribution-panel',
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    AddAllLayersToMap,
    AddLayerToMap,
    Button,
    Card,
    CopyInput,
    DownloadData,
    IftaLabel,
    InputText,
    KeyValuePipe,
    LinkBadge,
    NgIcon,
    NgTemplateOutlet,
    TranslatePipe,
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
        url.endsWith('.xlsx') ||
        link.protocol === 'OGC:WFS'
      );
    }
    return false;
  };

  isDatavizLink = (link: Link) => {
    return link.protocol === 'WWW:LINK:JUPYTER-NOTEBOOK' || link.protocol === 'WWW:LINK:DATAVIZ';
  };

  hasBulkWmsLinks = (links: Link[]) => {
    return (
      links.length > 1 &&
      links.every((link) => !!link.protocol?.match('OGC:WMS|application/vnd.ogc.wms_xml'))
    );
  };

  exploreData = (link: Link) => {
    // TODO: Not sure how to link actions to routing which is app specific
    this.router.navigate([RECORD_ROUTE_PATH, this.record().uuid, 'explore'], {
      queryParams: { datasource: link.urlObject?.['default'] },
    });
  };

  openDataviz = (link: Link) => {
    this.router.navigate([RECORD_ROUTE_PATH, this.record().uuid, 'explore'], {
      queryParams: { dataviz: link.urlObject?.['default'], notebook: null },
      queryParamsHandling: 'merge',
    });
  };
}
