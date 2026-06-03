import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCloudArrowDown,
  faSolidLink,
  faSolidNetworkWired,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Link } from 'gn-api-client';
import { ButtonIcon, ButtonLabel, ButtonModule } from 'primeng/button';
import { MapService } from '../map-service';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';

@Component({
  selector: 'app-record-distribution-badges',
  imports: [ButtonModule, ButtonIcon, ButtonLabel, KeyValuePipe, NgIcon, RouterLink, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidCloudArrowDown,
      faSolidLink,
      faSolidNetworkWired,
    }),
  ],
  templateUrl: './record-distribution-badges.html',
})
export class RecordDistributionBadges extends RecordDistributionFieldBase {
  private readonly mapService = inject(MapService);
  private readonly translateService = inject(TranslateService);

  types = input<string[]>([]);
  // TODO: check if we need a button mode
  layout = input<'badge' | 'button'>('badge');

  get iconsByType() {
    return this.distributionService.iconsByType;
  }

  linksBySectionsSelected = computed(() => {
    const allLinksBySections = this.linksBySections();
    if (this.types().length === 0) {
      return allLinksBySections;
    } else {
      const filteredLinks: Record<string, Link[]> = {};
      for (const type of this.types()) {
        if (allLinksBySections[type] !== undefined) {
          filteredLinks[type] = allLinksBySections[type];
        }
      }
      return filteredLinks;
    }
  });

  getSectionRouterLink(sectionKey: string, links: Link[]) {
    if (this.shouldTriggerAddAllToMap(sectionKey, links)) {
      return null;
    }
    return ['/record', this.record().uuid, 'data-access'];
  }

  getSectionQueryParams(sectionKey: string): Params | undefined {
    if (sectionKey.toLowerCase() !== 'download') {
      return undefined;
    }

    return { scrollTo: 'distribution-section-download' };
  }

  getSectionTooltip(sectionKey: string, links: Link[], defaultLabel: string): string {
    if (!this.shouldTriggerAddAllToMap(sectionKey, links)) {
      return defaultLabel;
    }

    return this.translateService.instant('record.action.addWms.addAllToMap');
  }

  onSectionClick = async (event: MouseEvent, sectionKey: string, links: Link[]) => {
    event.stopPropagation();

    if (!this.shouldTriggerAddAllToMap(sectionKey, links)) {
      return;
    }

    event.preventDefault();

    try {
      const validation = await this.mapService.validateBulkWmsLinks(links, 1);
      if (!validation) {
        return;
      }

      const matchingLayersLabel = validation.matchedLayerLabels.join(', ');
      const command = this.mapService.buildMapCommands(
        validation.validLinks,
        this.record().uuid,
        'wms',
        matchingLayersLabel,
      );

      this.mapService.navigateToMap(command, this.record().uuid, this.mapLayerDisplayTarget());
    } catch (error) {
      console.error(error);
    }
  };

  private mapLayerDisplayTarget = computed(
    () => this.appConfiguration().config?.apps?.record?.mapLayerDisplayTarget || 'main-map-tab',
  );

  private shouldTriggerAddAllToMap(sectionKey: string, links: Link[]): boolean {
    return sectionKey.toLowerCase() === 'api' && this.mapService.hasBulkWmsLinks(links, 1);
  }
}
