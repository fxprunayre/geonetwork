import { Directive, effect, inject, input, model, OnInit, untracked } from '@angular/core';
import { elasticsearch, IndexRecord } from 'gn-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_LANGUAGE, DEFAULT_SEARCH_LAYOUT_OPTIONS } from '../config/gn-constants';
import { SearchAppLayout } from '../config/model/gnConfig';
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
          this.searchStore.setAggregationsConfig(newAggregations);
        }
      });
    });
  }

  ngOnInit(): void {
    const configLayout =
      this.appConfig().config?.apps.search?.resultsLayoutOptions?.[0] ||
      DEFAULT_SEARCH_LAYOUT_OPTIONS[0];

    this.searchStore.init(
      this.scope(),
      this.aggregations(),
      this.size(),
      this.routing(),
      this.filter(),
      this.sort() || [DEFAULT_SORT],
      this.currentSort() || DEFAULT_SORT,
      this.language() || DEFAULT_LANGUAGE,
      this.layoutOptions()?.[0] || (configLayout as SearchAppLayout),
    );
    this.searchService.register(this.scope(), this.searchStore);
  }
}
