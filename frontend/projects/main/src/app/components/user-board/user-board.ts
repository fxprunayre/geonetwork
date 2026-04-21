import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidBookmark,
  faSolidCircleUser,
  faSolidFileImport,
  faSolidGear,
  faSolidLock,
  faSolidLockOpen,
  faSolidPenToSquare,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AggregationsPanel,
  APPLICATION_CONFIGURATION,
  AuthStore,
  DEFAULT_LANGUAGE,
  Gn4UrlService,
  RecordAddButton,
  ResultsNumberComponent,
  ResultsView,
  SearchContextDirective,
  SearchService,
  TranslationsService,
  UserFullNamePipe,
} from 'gn-library';
import { ButtonDirective } from 'primeng/button';
import { SearchHeader } from '../search-header/search-header';
import { UserBoardMenu } from '../user-board-menu/user-board-menu';

@Component({
  selector: 'app-user-board',
  imports: [
    NgIcon,
    TranslatePipe,
    SearchHeader,
    SearchContextDirective,
    RecordAddButton,
    ResultsNumberComponent,
    ResultsView,
    ButtonDirective,
    AggregationsPanel,
    UserFullNamePipe,
    UserBoardMenu,
  ],
  viewProviders: [
    provideIcons({
      faSolidPenToSquare,
      faSolidCircleUser,
      faSolidFileImport,
      faSolidBookmark,
      faSolidGear,
      faSolidArrowRightFromBracket,
      faSolidLockOpen,
      faSolidLock,
    }),
  ],
  templateUrl: './user-board.html',
})
export class UserBoard {
  readonly store = inject(AuthStore);
  searchService = inject(SearchService);
  appConfig = inject(APPLICATION_CONFIGURATION);
  gn4UrlService = inject(Gn4UrlService);

  user = this.store.user;

  userName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.name} ${u.username}` || u.email || '';
  });

  userRecordQuery = computed(() => {
    return `+owner:${this.user()?.id} +isTemplate:n`;
  });

  isAuthenticated = this.store.isAuthenticated;

  language = signal<string | undefined>(DEFAULT_LANGUAGE);

  translate = inject(TranslateService);
  translationsService = inject(TranslationsService);

  search = computed(() => {
    return this.searchService.getSearch('user-records');
  });

  aggregations = computed(() => {
    return Object.keys(this.search().aggregations());
  });

  importRecordUrl = computed(() => {
    return this.gn4UrlService.getEditorUrl('import');
  });

  constructor() {
    this.translate.onLangChange.subscribe((event) => {
      this.language.set(event.lang);
    });
  }

  userRecordAggregationConfig = [
    {
      isHarvested: {
        terms: {
          field: 'isHarvested',
          size: 2,
        },
      },
    },
    {
      isPublishedToAll: {
        terms: {
          field: 'isPublishedToAll',
          size: 2,
        },
        meta: {
          decorator: {
            type: 'icon',
            map: {
              false: 'faSolidLock',
              true: 'faSolidLockOpen',
            },
          },
        },
      },
    },
    {
      'cl_status.key': {
        terms: {
          field: 'cl_status.key',
          size: 15,
        },
      },
    },
    {
      isTemplate: {
        terms: {
          field: 'isTemplate',
          size: 5,
        },
        meta: {
          collapsed: true,
          decorator: {
            type: 'icon',
            map: {
              n: 'fa-file-text',
              y: 'fa-file',
            },
          },
          field: 'isTemplate',
        },
      },
    },
    // {
    //   recordOwner: {
    //     "terms": {
    //       "field": "recordOwner",
    //       "size": 5,
    //       "include": ".*"
    //     },
    //     "meta": {
    //       "collapsed": true,
    //       "field": "recordOwner"
    //     }
    //   },
    // },
    // {
    //   valid: {
    //     "terms": {
    //       "field": "valid",
    //       "size": 10
    //     },
    //     "meta": {
    //       "field": "valid"
    //     }
    //   },
    // },
    // {
    //   valid_inspire: {
    //     "terms": {
    //       "field": "valid_inspire",
    //       "size": 10
    //     },
    //     "meta": {
    //       "collapsed": true,
    //       "field": "valid_inspire"
    //     }
    //   },
    // },
    {
      resourceType: {
        terms: {
          field: 'resourceType',
          size: 9,
          exclude: 'publication-.*',
        },
        meta: {
          decorator: {
            type: 'icon',
            prefix: '',
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
  ];

  signOut() {
    this.store.signOut();
  }
}
