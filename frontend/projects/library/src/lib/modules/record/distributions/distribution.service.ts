import { computed, inject, Injectable } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { ConfigService } from '../../config/config.service';
import { Link } from 'gn-api-client';

@Injectable({
  providedIn: 'root',
})
export class DistributionService {
  appConfiguration = inject(APPLICATION_CONFIGURATION);
  distributionConfig = computed(() => this.appConfiguration().config?.apps.record?.distribution);

  configService = inject(ConfigService);

  iconsByType: Record<string, string> = {
    download: 'faSolidCloudArrowDown',
    api: 'faSolidNetworkWired',
    link: 'faSolidLink',
  };

  // sections: [
  //   {
  //     filter:
  //       'protocol:OGC:WMS|OGC:WMTS|ESRI:.*|atom.*|REST|OGC API Maps|OGC API Records',
  //     title: 'API',
  //   },
  linksBySections = (links: Link[] | null | undefined) => {
    const linksBySections: { [key: string]: Link[] } = {};
    if (!links) {
      return linksBySections;
    }

    this.distributionConfig()?.sections.map((section) => {
      let sectionFilter = this.configService.parseFilterExpression(section.filter);

      for (const link of links!) {
        if (this.configService.testExpressionFilters(sectionFilter, link)) {
          if (!linksBySections[section.title]) {
            linksBySections[section.title] = [];
          }
          linksBySections[section.title]!.push(link);
        }
      }
    });
    return linksBySections;
  };
}
