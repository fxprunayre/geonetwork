import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Link } from 'gn-api-client';
import { DistributionService } from '../distribution.service';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-link-badge',
  imports: [NgIcon],
  template: `<ng-icon class="text-2xl" [svg]="icon()" [title]="link().protocol" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkBadge {
  link = input.required<Link>();

  distributionService = inject(DistributionService);

  icon = computed(() => {
    const link = this.link();
    const url = link.urlObject?.['default'] || '';
    const protocol = link.protocol || '';
    const format =
      link.protocol?.indexOf('WWW:DOWNLOAD') === 0
        ? link.protocol.replace('WWW:DOWNLOAD-', '')
        : '';

    const iconByUrl = this.distributionService.iconsByUrl;
    for (const key in iconByUrl) {
      if (url.includes(key)) {
        return iconByUrl[key];
      }
    }

    const iconsByProtocol = this.distributionService.iconsByProtocol;
    if (iconsByProtocol[protocol]) {
      return iconsByProtocol[protocol];
    }

    const iconsByFormat = this.distributionService.iconsByFormat;
    if (iconsByFormat[format]) {
      return iconsByFormat[format];
    }

    return this.distributionService.iconsByType['links'];
  });
}
