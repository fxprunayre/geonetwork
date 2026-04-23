import { Directive, effect, inject, input, model, OnInit, untracked } from '@angular/core';
import { elasticsearch, IndexRecord } from 'gn-api-client';
import { DEFAULT_LANGUAGE } from '../config/gn-constants';
import { SearchService } from './search-service';
import { SearchStore } from './search-store';
import { DEFAULT_PAGE_SIZE, DEFAULT_SORT } from './search-store.model';

@Directive({
  selector: '[appSearchContext]',
  standalone: true,
  providers: [SearchStore],
})
export class SearchContextDirective implements OnInit {
  scope = input<string>('', { alias: 'appSearchContext' });
  routing = input<boolean>(false);
  filter = input<any>({});
  aggregations = input<any>({});
  size = input<number>(DEFAULT_PAGE_SIZE);
  sort = input<string[] | undefined>([DEFAULT_SORT]);
  currentSort = input<string | undefined>(DEFAULT_SORT);
  language = input<string | undefined>(DEFAULT_LANGUAGE);
  response = model<elasticsearch.SearchResponse<IndexRecord> | null>();

  searchStore = inject(SearchStore);
  searchService = inject(SearchService);

  constructor() {
    effect(() => {
      const newAggregations = this.aggregations();

      untracked(() => {
        const currentAggregations = this.searchStore.aggregationsConfig();
        if (JSON.stringify(newAggregations) !== JSON.stringify(currentAggregations)) {
          this.searchStore.setAggregationsConfig(newAggregations);
        }
      });
    });
  }

  ngOnInit(): void {
    this.searchStore.init(
      this.scope(),
      this.aggregations(),
      this.size(),
      this.routing(),
      this.filter(),
      this.sort() || [DEFAULT_SORT],
      this.currentSort() || DEFAULT_SORT,
      this.language() || DEFAULT_LANGUAGE,
    );
    this.searchService.register(this.scope(), this.searchStore);
  }
}
