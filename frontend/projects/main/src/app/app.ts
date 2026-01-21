import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_LANGUAGE,
  SearchApp,
  SearchContextDirective,
  SearchService,
} from 'gn-library';
import { TranslateService } from '@ngx-translate/core';
import { ScrollTop } from 'primeng/scrolltop';
import { Toast } from 'primeng/toast';
import { Navigation } from './components/menu/navigation';
import { PrimeShadowdomstyleComponent } from './p-shadowdomstyle-component';

@Component({
  selector: 'app-root',
  providers: [SearchService],
  imports: [RouterOutlet, FormsModule, SearchContextDirective, ScrollTop, Navigation, Toast],
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
  }

  override ngOnInit() {
    super.ngOnInit();
    this.router.initialNavigation();
  }
}
