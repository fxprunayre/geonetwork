import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { APPLICATION_CONFIGURATION, ResultsView, SearchBase } from 'gn-library';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { FilterPanelLayout } from '../../shared/models/search-layout.model';
import { PageLayout } from '../page-layout/page-layout';
import { ResultsInfo } from '../results-info/results-info';

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

  bannerBackground = computed(() => this.appConfiguration().config?.bannerBackground || '');

  resultsLayoutOptions = computed(
    () => this.appConfiguration().config?.apps.search?.resultsLayoutOptions || [],
  );

  get hasResults(): boolean {
    return this.search?.totalCount() > 0;
  }
}
