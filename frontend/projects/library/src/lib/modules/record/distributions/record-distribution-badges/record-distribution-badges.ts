import { KeyValuePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Link } from 'gn-api-client';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCloudArrowDown,
  faSolidLink,
  faSolidNetworkWired,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Link } from 'gn-api-client';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';

@Component({
  selector: 'app-record-distribution-badges',
  imports: [KeyValuePipe, RouterLink, TranslatePipe, NgIcon, ButtonIcon, ButtonLabel, Button],
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
}
