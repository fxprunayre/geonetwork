import { Directive, effect, inject, input, model, OnInit, untracked } from '@angular/core';
import { elasticsearch, IndexRecord } from 'gn-api-client';
import { selectSearchAppConfiguration } from '../config/app-config.selectors';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { SearchAppLayout } from '../config/model/gnConfig';
import { DEFAULT_LANGUAGE } from '../i18n/config/i18n-config';
import { AggregationStore } from './aggregation-store';
import { DEFAULT_SEARCH_LAYOUT_OPTIONS } from './config/search-config';
import { FilterStore } from './filter-store';
import { SearchRouteSyncService } from './search-route-sync.service';
import { SearchService } from './search-service';
import { SearchStore } from './search-store';
import { DEFAULT_PAGE_SIZE, DEFAULT_SORT } from './search-store.model';

@Directive({
  selector: '[appSearchContext]',
  standalone: true,
  providers: [SearchStore, FilterStore, AggregationStore, SearchRouteSyncService],
})
export class SearchContextDirective implements OnInit {
  scope = input<string>('', { alias: 'appSearchContext' });
  routing = input<boolean>(false);
  filter = input<unknown>({});
  aggregations = input<unknown[]>([]);
  size = input<number>(DEFAULT_PAGE_SIZE);
  sort = input<string[] | undefined>([DEFAULT_SORT]);
  currentSort = input<string | undefined>(DEFAULT_SORT);
  language = input<string | undefined>(DEFAULT_LANGUAGE);
  layoutOptions = input<SearchAppLayout[] | undefined>(DEFAULT_SEARCH_LAYOUT_OPTIONS);
  response = model<elasticsearch.SearchResponse<IndexRecord> | null>();

  searchStore = inject(SearchStore);
  searchService = inject(SearchService);
  appConfig = inject(APPLICATION_CONFIGURATION);

  constructor() {
    effect(() => {
      const newAggregations = this.aggregations();

      untracked(() => {
        const currentAggregations = this.searchStore.aggregationsConfig();
        if (JSON.stringify(newAggregations) !== JSON.stringify(currentAggregations)) {
          this.searchStore.setAggregationsConfig(
            newAggregations as (
              | string
              | Record<string, elasticsearch.AggregationsAggregationContainer>
            )[],
          );
        }
      });
    });

    effect(() => {
      const newFilter = this.filter();

      untracked(() => {
        const currentFilter = this.searchStore.filter();
        if (JSON.stringify(newFilter) !== JSON.stringify(currentFilter)) {
          this.searchStore.setFilter(
            newFilter as
              | elasticsearch.QueryDslQueryContainer
              | elasticsearch.QueryDslQueryContainer[],
          );
        }
      });
    });
  }

  ngOnInit(): void {
    const configLayout =
      selectSearchAppConfiguration(this.appConfig()).resultsLayoutOptions?.[0] ||
      DEFAULT_SEARCH_LAYOUT_OPTIONS[0];

    this.searchStore.init(
      this.scope(),
      this.aggregations() as (
        | string
        | Record<string, elasticsearch.AggregationsAggregationContainer>
      )[],
      this.size(),
      this.routing(),
      this.filter() as
        | elasticsearch.QueryDslQueryContainer
        | elasticsearch.QueryDslQueryContainer[],
      this.sort() || [DEFAULT_SORT],
      this.currentSort() || DEFAULT_SORT,
      this.language() || DEFAULT_LANGUAGE,
      this.layoutOptions()?.[0] || (configLayout as SearchAppLayout),
    );
    this.searchService.register(this.scope(), this.searchStore);
  }
}
