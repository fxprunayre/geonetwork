import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidBookmark,
  faSolidCircleUser,
  faSolidFileImport,
  faSolidFilter,
  faSolidGear,
  faSolidLock,
  faSolidLockOpen,
  faSolidPenToSquare,
  faSolidXmark,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AggregationsPanel,
  APPLICATION_CONFIGURATION,
  AuthStore,
  DEFAULT_LANGUAGE,
  Gn4UrlService,
  ResultsNumberComponent,
  ResultsView,
  SearchContextDirective,
  SearchService,
  SearchStoreType,
  TranslationsService,
  UserFullNamePipe,
} from 'gn-library';
import { UserselectionsService } from 'gn4-api-client';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { catchError, filter, of } from 'rxjs';
import { FilterPanelLayout } from '../../shared/models/search-layout.model';
import { PageLayout } from '../page-layout/page-layout';
import { SearchPanelControls } from '../search-panel-controls/search-panel-controls';
import { UserBoardMenu } from '../user-board-menu/user-board-menu';

@Component({
  selector: 'app-user-board',
  standalone: true,
  imports: [
    NgIcon,
    TranslatePipe,
    PageLayout,
    SearchContextDirective,
    ResultsNumberComponent,
    ResultsView,
    AggregationsPanel,
    SearchPanelControls,
    UserFullNamePipe,
    UserBoardMenu,
    Drawer,
    Button,
    Tabs,
    Tab,
    TabPanels,
    TabPanel,
    TabList,
    NgTemplateOutlet,
  ],
  viewProviders: [
    provideIcons({
      faSolidPenToSquare,
      faSolidCircleUser,
      faSolidFileImport,
      faSolidBookmark,
      faSolidGear,
      faSolidFilter,
      faSolidArrowRightFromBracket,
      faSolidLockOpen,
      faSolidLock,
      faSolidXmark,
    }),
  ],
  templateUrl: './user-board.html',
})
export class UserBoard {
  readonly store = inject(AuthStore);
  private readonly router = inject(Router);
  searchService = inject(SearchService);
  appConfig = inject(APPLICATION_CONFIGURATION);
  gn4UrlService = inject(Gn4UrlService);
  userSelectionsService = inject(UserselectionsService);

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
    return this.searchService.getSearch<SearchStoreType>('user-records');
  });

  aggregations = computed(() => {
    return Object.keys(this.search().aggregations());
  });

  importRecordUrl = computed(() => {
    return this.gn4UrlService.getEditorUrl('import');
  });

  isUserSelectionsEnabled = computed(
    () => this.appConfig().config?.apps?.userSelections?.enabled ?? true,
  );

  bookmarkedUuids = signal<string[]>([]);
  bookmarksLoading = signal(false);
  bookmarksRefreshTick = signal(0);
  filtersVisible = signal(false);
  viewportWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1024);

  filterPosition = computed<FilterPanelLayout>(
    () => (this.appConfig().config?.apps?.search?.filterPosition as FilterPanelLayout) || 'side',
  );

  isSmallViewport = computed(() => this.viewportWidth() < 640);

  effectiveFilterPanelMode = computed<FilterPanelLayout>(() => {
    if (
      (this.filterPosition() === 'side' || this.filterPosition() === 'side-fixed') &&
      this.isSmallViewport()
    ) {
      return 'drawer';
    }
    return this.filterPosition();
  });

  bookmarkedRecordsFilter = computed(() => [
    {
      terms: {
        uuid: this.bookmarkedUuids(),
      },
    },
  ]);

  constructor() {
    this.translate.onLangChange.subscribe((event) => {
      this.language.set(event.lang);
    });

    effect((onCleanup) => {
      this.bookmarksRefreshTick();
      const appEnabled = this.isUserSelectionsEnabled();
      const userId = Number(this.user()?.id);

      if (!appEnabled || !userId) {
        this.bookmarkedUuids.set([]);
        this.bookmarksLoading.set(false);
        return;
      }

      this.bookmarksLoading.set(true);
      const sub = this.userSelectionsService
        .getSelectionRecords(0, userId)
        .pipe(catchError(() => of([] as string[])))
        .subscribe((uuids) => {
          this.bookmarkedUuids.set(uuids || []);
          this.bookmarksLoading.set(false);
        });

      onCleanup(() => sub.unsubscribe());
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter((event) => event.urlAfterRedirects.startsWith('/dashboard')),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.bookmarksRefreshTick.update((v) => v + 1);
      });
  }

  @HostListener('window:resize')
  onResize() {
    this.viewportWidth.set(window.innerWidth);
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
