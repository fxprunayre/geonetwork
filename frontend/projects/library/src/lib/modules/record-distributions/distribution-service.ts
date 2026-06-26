import { computed, inject, Injectable } from '@angular/core';
import { faBrandBitbucket, faBrandGithub, faBrandGitlab } from '@ng-icons/font-awesome/brands';
import {
  faSolidCloudArrowDown,
  faSolidDroplet,
  faSolidFileCode,
  faSolidFileExcel,
  faSolidFilePdf,
  faSolidFileZipper,
  faSolidLink,
  faSolidListCheck,
  faSolidMap,
  faSolidTable,
  faSolidTableCellsLarge,
} from '@ng-icons/font-awesome/solid';
import {
  simpleApacheparquet,
  simpleDoi,
  simpleEsri,
  simpleMarkdown,
  simpleRss,
  simpleZenodo,
} from '@ng-icons/simple-icons';
import { Link } from 'gn-api-client';
import { ConfigService } from '../config/config-service';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';

@Injectable({
  providedIn: 'root',
})
export class DistributionService {
  appConfiguration = inject(APPLICATION_CONFIGURATION);
  distributionConfig = computed(() => this.appConfiguration().config?.apps.record?.distribution);

  configService = inject(ConfigService);

  iconsByType: Record<string, string> = {
    download: faSolidCloudArrowDown,
    api: faSolidMap,
    links: faSolidLink,
    mapLegend: faSolidDroplet,
    featureCatalog: faSolidTable,
    quality: faSolidListCheck,
  };

  iconsByProtocol: Record<string, string> = {
    'OGC:WFS': faSolidCloudArrowDown,
    'OGC:WMS': faSolidMap,
    'OGC:WMTS': faSolidMap,
    'ESRI:REST': faSolidMap,
    ATOM: simpleRss,
    'WWW:DOI': faSolidLink,
    'WWW:DOWNLOAD': faSolidCloudArrowDown,
  };

  iconsByFormat: Record<string, string> = {
    parquet: simpleApacheparquet,
  };

  iconsByUrl: Record<string, string> = {
    'github.com': faBrandGithub,
    'gitlab.com': faBrandGitlab,
    'bitbucket.org': faBrandBitbucket,
    'doi.org': simpleDoi,
    'zenodo.org': simpleZenodo,
    '.pdf': faSolidFilePdf,
    '.md': simpleMarkdown,
    '.xml': faSolidFileCode,
    '.xls': faSolidFileExcel,
    '.csv': faSolidTable,
    '.tsv': faSolidTable,
    '.zip': faSolidFileZipper,
    '.rar': faSolidFileZipper,
    '.shp': simpleEsri,
    '.tif': faSolidTableCellsLarge,
    '.parquet': simpleApacheparquet,
  };

  // sections: [
  //   {
  //     filter:
  //       'protocol:OGC:WMS|OGC:WMTS|ESRI:.*|atom.*|REST|OGC API Maps|OGC API Records',
  //     title: 'API',
  //   },
  linksBySections = (links: Link[] | null | undefined) => {
    const linksBySections: Record<string, Link[]> = {};
    if (!links) {
      return linksBySections;
    }

    this.distributionConfig()?.sections.map((section) => {
      const sectionFilter = this.configService.parseFilterExpression(section.filter);

      for (const link of links!) {
        if (
          this.configService.testExpressionFilters(
            sectionFilter,
            link as unknown as Record<string, string | undefined>,
          )
        ) {
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
