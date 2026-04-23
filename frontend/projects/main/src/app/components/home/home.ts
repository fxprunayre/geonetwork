import { Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { APPLICATION_CONFIGURATION, DEFAULT_LANGUAGE, SearchContextDirective } from 'gn-library';
import { PageLayout } from '../page-layout/page-layout';
import { HomeHighlights } from './home-highlights/home-highlights';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeHighlights, SearchContextDirective, PageLayout, TranslatePipe],
  templateUrl: './home.html',
})
export class Home {
  appConfiguration = inject(APPLICATION_CONFIGURATION);

  homeAggregationConfig = computed(
    () => this.appConfiguration().config?.apps?.home?.aggregations || [],
  );

  language = signal<string | undefined>(DEFAULT_LANGUAGE);

  translate = inject(TranslateService);

  constructor() {
    this.translate.onLangChange.subscribe((event) => {
      this.language.set(event.lang);
    });
  }
}
