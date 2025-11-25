import { Component, computed, input } from '@angular/core';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';
import { KeyValuePipe } from '@angular/common';
import { Link } from 'gn-api-client';
import { Badge } from 'primeng/badge';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-record-distribution-badges',
  imports: [KeyValuePipe, Badge, RouterLink],
  templateUrl: './record-distribution-badges.html',
})
export class RecordDistributionBadges extends RecordDistributionFieldBase {
  types = input<string[]>([]);
  // TODO: check if we need a button mode
  layout = input<'badge' | 'button'>('badge');
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
