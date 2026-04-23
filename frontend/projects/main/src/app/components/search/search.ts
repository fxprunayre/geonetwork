import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { APPLICATION_CONFIGURATION, ResultsView, SearchBase } from 'gn-library';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PageLayout } from '../page-layout/page-layout';
import { ResultsInfo } from '../results-info/results-info';

export type FilterPanelLayout = 'drawer' | 'side' | 'top';

@Component({
  selector: 'app-search',
  imports: [ResultsInfo, ResultsView, FormsModule, OverlayBadgeModule, PageLayout],
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search extends SearchBase {
  filterPanelMode = signal<FilterPanelLayout>('side');

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  backgroundImageUrl = computed(() => this.appConfiguration().config?.backgroundImageUrl || '');

  resultsLayoutOptions = computed(
    () => this.appConfiguration().config?.apps.search?.resultsLayoutOptions || [],
  );

  get hasResults(): boolean {
    return this.search?.totalCount() > 0;
  }
}
