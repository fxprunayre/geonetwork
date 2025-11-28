import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  APPLICATION_CONFIGURATION,
  SearchApp,
  SearchContextDirective,
  SearchService,
} from 'gn-library';
import { TranslateService } from '@ngx-translate/core';
import { ScrollTop } from 'primeng/scrolltop';
import { Navigation } from './components/menu/navigation';

@Component({
  selector: 'app-root',
  providers: [SearchService],
  imports: [RouterOutlet, FormsModule, SearchContextDirective, ScrollTop, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  private translate = inject(TranslateService);

  protected readonly title = signal('main');

  searchConfig: SearchApp =
    inject(APPLICATION_CONFIGURATION).config?.apps.search || ({} as SearchApp);

  searchPageSize =
    inject(APPLICATION_CONFIGURATION).config?.apps.search?.hitsPerPageOptions[0] || 10;

  constructor() {
    this.translate.addLangs(['en']);
  }
}
