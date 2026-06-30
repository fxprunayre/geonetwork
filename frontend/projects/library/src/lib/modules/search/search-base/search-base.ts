import { computed, Directive, inject, input } from '@angular/core';
import { SearchService } from '../search-service';
import { SearchStoreType } from '../search-store';

@Directive({
  standalone: true,
})
export class SearchBase {
  scope = input<string>('main');
  searchService = inject(SearchService);
  search = computed(() => this.searchService.getSearch<SearchStoreType>(this.scope()));
}
