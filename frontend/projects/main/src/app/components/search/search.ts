import { Component, computed, inject, linkedSignal } from '@angular/core';
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
})
export class Search extends SearchBase {
  appConfiguration = inject(APPLICATION_CONFIGURATION);

  filterPosition = linkedSignal<FilterPanelLayout>(
    () =>
      (this.appConfiguration().config?.apps?.search?.filterPosition as FilterPanelLayout) || 'side',
  );

  bannerBackground = computed(() => this.appConfiguration().config?.apps?.banner?.background || '');

  resultsLayoutOptions = computed(
    () => this.appConfiguration().config?.apps.search?.resultsLayoutOptions || [],
  );

  get hasResults(): boolean {
    return this.search()?.totalCount() > 0;
  }
}
