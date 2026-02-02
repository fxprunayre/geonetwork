import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANGUAGE, SearchContextDirective } from 'gn-library';
import { SearchHeader } from '../search-header/search-header';
import { HomeHighlights } from './home-highlights/home-highlights';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeHighlights, SearchContextDirective, SearchHeader],
  templateUrl: './home.html',
})
export class Home {
  homeAggregationConfig = [
    {
      resourceType: {
        terms: {
          field: 'resourceType',
          size: 9,
          exclude: 'publication-.*',
        },
        meta: {
          layout: 'card',
          decorator: {
            type: 'icon',
            prefix: 'p-2 text-4xl',
            map: {
              dataset: 'faSolidDatabase',
              map: 'faSolidMap',
              featureCatalog: 'faSolidTable',
              document: 'faSolidCopy',
              service: 'faSolidCloud',
              series: 'faSolidCopy',
              nonGeographicDataset: 'faSolidChartColumn',
              publication: 'faSolidBook',
            },
          },
        },
      },
    },
    {
      'th_sextant-theme_tree.key': {
        terms: {
          field: 'th_sextant-theme_tree.key',
          size: 9,
          include: '[^^]+',
        },
        meta: {
          orderByTranslation: true,
          translateOnLoad: true,
          layout: 'card',
          decorator: {
            type: 'img',
            map: {
              // Imagery
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/34bad830-04ed-4d92-83ad-bf35d5c840a1':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/hyperspectrale-la-reunion/1603154-3-fre-FR/Hyperspectrale-La-Reunion.png',
              // Biologique
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/c17e50a2-5e3d-40da-94e0-b31327977947':
                'https://sextant.ifremer.fr/geonetwork/srv/api/records/d90bc6fa-5416-4064-97b6-8f671de3e407/attachments/zfhi.jpg',
              // Physique
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/d6f5b49f-fa79-4788-a34c-ab342cb85463':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/habitats-physiques/1595588-2-fre-FR/Habitats-physiques.png',
              // Maps
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/ac4c92ba-171b-4e0a-aa3b-a81adf497921':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/bathymetrie-emodnet/1595576-2-fre-FR/Bathymetrie-Emodnet.png',
              // Regulation
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/73a55b62-adf3-4b89-9fd2-5f277cffb47b':
                'https://sextant.ifremer.fr/geonetwork/srv/api/records/d275ec6a-603b-4170-add2-9b52ce190793/attachments/165.JPG',
              // Activité
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/7898b87e-208a-421f-b1b4-3697f895ddd9':
                'https://sextant.ifremer.fr/documentation/emodnet_chemistry/images/2023/mlf_density_nb_l_other.png',
              'https://vocab.ifremer.fr/scheme/SXT/sextant-theme/355023fd-7289-40ce-8c5c-c725232e039f':
                'https://sextant.ifremer.fr/var/storage/images/_aliases/listitem_thumbnail/medias-ifremer/medias-sextant/accueil/cartes-thematiques/bigood/1595612-3-fre-FR/BIGOOD.png',
            },
          },
        },
      },
      'th_simm-reglementaire_tree.key': {
        terms: {
          field: 'th_simm-reglementaire_tree.key',
          size: 9,
        },
        meta: {
          thesaurus: 'simm.reglementaire',
          translateOnLoad: true,
          layout: 'card',
        },
      },
      'th_dcsmm-area_tree.key': {
        terms: {
          field: 'th_dcsmm-area_tree.key',
          size: 30,
        },
        meta: {
          thesaurus: 'dcsmm.area',
          translateOnLoad: true,
          layout: 'card',
        },
      },
      'th_dcsmm-descripteur_tree.key': {
        terms: {
          field: 'th_dcsmm-descripteur_tree.key',
          size: 30,
        },
        meta: {
          translateOnLoad: true,
          layout: 'card',
        },
      },
      'th_odatis_centre_donnees_tree.key': {
        terms: {
          field: 'th_odatis_centre_donnees_tree.key',
          size: 30,
        },
        meta: {
          translateOnLoad: true,
          layout: 'card',
        },
      },
      'th_NVS-OD1_tree.key': {
        terms: {
          field: 'th_NVS-OD1_tree.key',
          size: 30,
        },
        meta: {
          thesaurus: 'NVS.OD1',
          translateOnLoad: true,
          layout: 'card',
        },
      },
    },
  ];

  language = signal<string | undefined>(DEFAULT_LANGUAGE);

  translate = inject(TranslateService);

  constructor() {
    this.translate.onLangChange.subscribe((event) => {
      this.language.set(event.lang);
    });
  }
}
