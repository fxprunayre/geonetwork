import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  AuthStore,
  BaseComponent,
  CatalogueStore,
  DEFAULT_LANGUAGE,
  DEFAULT_SEARCH_APP_CONFIGURATION,
  DEFAULT_SEARCH_APP_HITS_PER_PAGE_OPTIONS,
  MAP_SLUG,
  SEARCH_SLUG,
  SearchApp,
  SearchContextDirective,
  SearchService,
  SearchStoreType,
} from 'gn-library';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { filter } from 'rxjs';
import { MapComponent } from './components/map/map';
import { MenuComponent } from './components/menu/menu';
import { Search } from './components/search/search';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPlugCircleExclamation } from '@ng-icons/font-awesome/solid';
import { TranslateModule } from '@ngx-translate/core';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-root',
  providers: [SearchService, provideIcons({ faSolidPlugCircleExclamation })],
  imports: [
    RouterOutlet,
    FormsModule,
    SearchContextDirective,
    ScrollTop,
    MenuComponent,
    Toast,
    MapComponent,
    Search,
    MessageModule,
    TranslateModule,
    NgIcon,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class App extends BaseComponent implements OnInit {
  private translate = inject(TranslateService);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private authStore = inject(AuthStore);
  appConfig = inject(APPLICATION_CONFIGURATION);
  catalogueStore = inject(CatalogueStore);

  protected readonly title = signal('main');
  isMapActive = signal(false);
  isSearchActive = signal(false);

  searchConfig = computed<SearchApp>(
    () => this.appConfig().config?.apps.search || DEFAULT_SEARCH_APP_CONFIGURATION,
  );

  searchPageSize = computed(
    () =>
      this.searchConfig().hitsPerPageOptions?.[0] || DEFAULT_SEARCH_APP_HITS_PER_PAGE_OPTIONS[0],
  );

  searchLanguage = signal<string | undefined>(
    this.appConfig().config?.apps.i18n?.language || DEFAULT_LANGUAGE,
  );

  constructor() {
    super();
    this.translate.addLangs(['en']);
    this.translate.onLangChange.subscribe((event) => {
      this.searchService.getSearch<SearchStoreType>('main').setLanguage(event.lang);
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.isMapActive.set(url.startsWith('/' + MAP_SLUG));
        this.isSearchActive.set(url.startsWith('/' + SEARCH_SLUG));
      });
    this.authStore.loadUser();
  }

  override ngOnInit() {
    super.ngOnInit();

    const config = this.appConfig().config;

    // Evaluate which app should be the default route if we are at root
    if (window.location.hash === '#/' || window.location.hash === '') {
      if (config?.apps.home?.enabled === false) {
        if (config?.apps.search?.enabled !== false) {
          this.router.navigate(['/' + SEARCH_SLUG]);
        } else if (config?.apps.map?.enabled !== false) {
          this.router.navigate(['/' + MAP_SLUG]);
        }
      }
    }

    this.router.initialNavigation();
  }
}
