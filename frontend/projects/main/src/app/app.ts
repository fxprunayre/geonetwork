import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_LANGUAGE,
  MAP_SLUG,
  SEARCH_SLUG,
  SearchApp,
  SearchContextDirective,
  SearchService,
} from 'gn-library';
import { TranslateService } from '@ngx-translate/core';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { MenuComponent } from './components/menu/menu';
import { MapComponent } from './components/map/map';
import { Search } from './components/search/search';
import { PrimeShadowdomstyleComponent } from './p-shadowdomstyle-component';

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
export class App extends PrimeShadowdomstyleComponent implements OnInit {
  private translate = inject(TranslateService);
  private router = inject(Router);
  private searchService = inject(SearchService);

  protected readonly title = signal('main');
  isMapActive = signal(false);
  isSearchActive = signal(false);

  searchConfig: SearchApp =
    inject(APPLICATION_CONFIGURATION)().config?.apps.search || ({} as SearchApp);

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
  }

  override ngOnInit() {
    super.ngOnInit();
    this.router.initialNavigation();
  }
}
