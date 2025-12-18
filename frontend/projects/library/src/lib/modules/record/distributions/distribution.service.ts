import { computed, inject, Injectable } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { ConfigService } from '../../config/config.service';
import { Link } from 'gn-api-client';
import { faBrandBitbucket, faBrandGithub, faBrandGitlab } from '@ng-icons/font-awesome/brands';
import {
  simpleApacheparquet,
  simpleDoi,
  simpleEsri,
  simpleMarkdown,
  simpleRss,
  simpleZenodo,
} from '@ng-icons/simple-icons';
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
