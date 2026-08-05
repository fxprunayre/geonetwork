import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchService } from '../search/search-service';
import { SearchStoreType } from '../search/search-store';

@Component({
  selector: 'app-results-number',
  imports: [DecimalPipe, TranslatePipe],
  template: ` @if (search().hasResults()) {
    <span class="text-primary-400" data-testid="search-results-number"
      >{{ search().totalCount() | number }} {{ labelKey() | translate }}</span
    >
  }`,
})
export class ResultsNumberComponent {
  scope = input<string>('main');
  searchService = inject(SearchService);
  search = computed(() => this.searchService.getSearch<SearchStoreType>(this.scope()));

  // TODO: pluralization
  labelKey = input('search.results');
}
