import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  AuthStore,
  BaseComponent,
  DEFAULT_LANGUAGE,
  DEFAULT_SEARCH_APP_CONFIGURATION,
  MAP_SLUG,
  SEARCH_SLUG,
  SearchApp,
  SearchContextDirective,
  SearchService,
} from 'gn-library';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { filter } from 'rxjs';
import { MapComponent } from './components/map/map';
import { MenuComponent } from './components/menu/menu';
import { Search } from './components/search/search';

@Component({
  selector: 'app-root',
  providers: [SearchService],
  imports: [
    RouterOutlet,
    FormsModule,
    SearchContextDirective,
    ScrollTop,
    MenuComponent,
    Toast,
    MapComponent,
    Search,
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

  protected readonly title = signal('main');
  isMapActive = signal(false);
  isSearchActive = signal(false);

  searchConfig: SearchApp =
    inject(APPLICATION_CONFIGURATION)().config?.apps.search || DEFAULT_SEARCH_APP_CONFIGURATION;

  searchPageSize =
    inject(APPLICATION_CONFIGURATION)().config?.apps.search?.hitsPerPageOptions[0] || 10;

  language = signal<string | undefined>(DEFAULT_LANGUAGE);

  constructor() {
    super();
    this.translate.addLangs(['en']);
    this.translate.onLangChange.subscribe((event) => {
      this.searchService.getSearch('main').setLanguage(event.lang);
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
    this.router.initialNavigation();
  }
}
