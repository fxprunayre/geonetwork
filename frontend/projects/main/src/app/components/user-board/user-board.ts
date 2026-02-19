import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidBookmark,
  faSolidCircleUser,
  faSolidGear,
  faSolidLock,
  faSolidLockOpen,
  faSolidPenToSquare,
  faSolidPlus,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AggregationsPanel,
  AuthStore,
  DEFAULT_LANGUAGE,
  RecordAddMenu,
  ResultsNumberComponent,
  ResultsView,
  SearchContextDirective,
  SearchService,
  UserAvatar,
  UserFullNamePipe,
} from 'gn-library';
import { Button } from 'primeng/button';
import { SearchHeader } from '../search-header/search-header';

@Component({
  selector: 'app-user-board',
  imports: [
    NgIcon,
    TranslatePipe,
    SearchHeader,
    SearchContextDirective,
    ResultsNumberComponent,
    ResultsView,
    Button,
    AggregationsPanel,
    UserAvatar,
    RecordAddMenu,
    UserFullNamePipe,
  ],
  viewProviders: [
    provideIcons({
      faSolidPenToSquare,
      faSolidCircleUser,
      faSolidPlus,
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
  @ViewChild(RecordAddMenu) recordAddMenu: RecordAddMenu | undefined;

  readonly store = inject(AuthStore);
  searchService = inject(SearchService);

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

  search = computed(() => {
    return this.searchService.getSearch('user-records');
  });

  aggregations = computed(() => {
    return Object.keys(this.search().aggregations());
  });
  recordAddButton: any;

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
