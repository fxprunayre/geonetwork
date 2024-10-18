import {
  AggregationsAggregationContainer,
  AggregationsTermsAggregation,
  QueryDslFunctionScoreQuery,
  SearchTotalHits,
  Sort,
} from '@elastic/elasticsearch/lib/api/types';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  from,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { SearchService } from './search.service';
import {
  Search,
  SearchAggRefreshPolicy,
  SearchFilter,
  SearchFilterParameters,
  SearchRequestPageParameters,
  SearchRequestParameters,
} from './search.state.model';

export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_SCORE = null;

export const DEFAULT_SORT: Sort = ['_score'];

const initialSearchState: Search = {
  id: '',
  aggregationConfig: {},
  functionScore: DEFAULT_SCORE,
  isSearching: false,
  isReset: false,
  fullTextQuery: '',
  from: 0,
  size: DEFAULT_PAGE_SIZE,
  pageSize: DEFAULT_PAGE_SIZE,
  sort: DEFAULT_SORT,
  filters: {},
  filter: '',
  response: null,
  aggregation: {},
  error: null,
};

export const SearchStore = signalStore(
  withState(initialSearchState),
  withComputed(store => {
    return {
      searchFilterParameters: computed(() => {
        return {
          fullTextQuery: store.fullTextQuery(),
          filters: store.filters(),
          filter: store.filter(),
          sort: store.sort(),
          aggregationConfig: store.aggregationConfig(),
        } as SearchFilterParameters;
      }),
      searchRequestPageParameters: computed(() => {
        return {
          from: store.from(),
          size: store.size(),
        } as SearchRequestPageParameters;
      }),
      hasMore: computed(() => {
        let total = store.response()?.hits.total as SearchTotalHits;
        return (
          total && total.value && store.from() + store.size() < total.value
        );
      }),
    };
  }),
  withMethods((store, searchService = inject(SearchService)) => ({
    init(
      searchId: string,
      aggregationConfig: Record<string, AggregationsAggregationContainer>,
      functionScore: QueryDslFunctionScoreQuery | null,
      size: number,
      sort: Sort,
      filter: string
    ) {
      patchState(store, {
        id: searchId,
        aggregationConfig,
        functionScore,
        size: size,
        pageSize: size,
        filter: filter,
        sort: sort || DEFAULT_SORT,
      });
    },
    setFullTextQuery(value: string) {
      patchState(store, { fullTextQuery: value });
    },
    search: rxMethod<SearchFilterParameters>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() =>
          patchState(store, { isSearching: true, response: null, error: null })
        ),
        switchMap(searchFilterParameters =>
          from(
            searchService.search({
              ...searchFilterParameters,
              from: 0,
              size: store.size(),
              sort: store.sort(),
              functionScore: store.functionScore(),
              filter: store.filter(),
            } as SearchRequestParameters)
          ).pipe(
            tapResponse({
              next: response => {
                let aggregationConfig = store.aggregationConfig();

                const aggregationToKeep = Object.fromEntries(
                  Object.entries(store.aggregation()).filter(
                    ([key]) =>
                      aggregationConfig[key]?.meta?.refreshPolicy ===
                      SearchAggRefreshPolicy.NO_REFRESH
                  )
                );
                const aggregation = {
                  ...response.aggregations,
                  ...aggregationToKeep,
                };
                patchState(store, { response, aggregation });
              },
              error: () => {
                const error: Error = {
                  name: 'Search error',
                  message: `An error occurred while searching in context ${store.id()}. Check the console for more details and the search configuration for this context.`,
                };
                console.error(error);
                patchState(store, { error: error });
              },
              finalize: () => patchState(store, { isSearching: false }),
            })
          )
        )
      )
    ),
    reset() {
      patchState(store, {
        isReset: true,
        filters: {},
        aggregation: {},
        fullTextQuery: '',
        from: 0,
      });
    },
    setFilter(value: string) {
      patchState(store, { filter: value });
    },
    isFilterActive(field: string, value: string) {
      const filter = store.filters()[field];
      return filter?.values[value];
    },
    addFilter(newFilter: SearchFilter, replaceFilter: boolean = false) {
      const filters = store.filters();
      const existingFilter = filters[newFilter.field];
      if (existingFilter && !replaceFilter) {
        existingFilter.values = {
          ...existingFilter.values,
          ...newFilter.values,
        };
      } else {
        filters[newFilter.field] = newFilter;
      }
      patchState(store, state => ({
        from: 0,
        size: store.pageSize(),
        filters: { ...filters },
      }));
    },
    removeFilter(field: string) {
      const filters = store.filters();
      delete filters[field];
      patchState(store, state => ({
        from: 0,
        size: store.pageSize(),
        filters: { ...filters },
      }));
    },
    removeFilterValue(field: string, value: string) {
      const filters = store.filters();
      const existingFilter = filters[field];
      if (existingFilter) {
        delete existingFilter.values[value];
      } else {
        console.warn(`No filter found for field ${field}.`);
      }
      patchState(store, state => ({
        from: 0,
        size: store.pageSize(),
        filters: { ...filters },
      }));
    },
    setPageSize(pageSize: number) {
      patchState(store, { pageSize, size: pageSize });
    },
    setSort(sort: Sort) {
      patchState(store, {
        sort,
        from: 0,
        size: store.pageSize(),
      });
    },
    more(size: number) {
      patchState(store, { from: store.from() + store.size() });
    },
    setPage(from: number, size: number) {
      let response = store.response();
      if (response) {
        response.hits.hits = [];
      }
      patchState(store, { from, size, response });
    },
    next() {
      patchState(store, { from: store.from() + store.size() });
    },
    previous() {
      patchState(store, { from: store.from() - store.size() });
    },
    paging: rxMethod<SearchRequestPageParameters>(
      pipe(
        // distinctUntilChanged(),
        filter(() => !!store.response()),
        tap(() => patchState(store, { isSearching: true, error: null })),
        switchMap(searchRequestPageParameters =>
          from(
            searchService.page({
              ...store.searchFilterParameters(),
              ...searchRequestPageParameters,
              sort: store.sort(),
              functionScore: store.functionScore(),
              filter: store.filter(),
            })
          ).pipe(
            tap(console.log),
            tapResponse({
              next: newHits => {
                let response = store.response();
                if (response) {
                  response.hits.hits = response.hits.hits.concat(
                    newHits.hits.hits
                  );
                  patchState(store, {
                    response,
                  });
                }
              },
              error: console.log,
              finalize: () => patchState(store, { isSearching: false }),
            })
          )
        )
      )
    ),
    buildDefaultAggregationConfig(key: string) {
      return {
        terms: {
          field: key,
          size: 50,
        },
        meta: {
          refreshPolicy: SearchAggRefreshPolicy.NO_REFRESH,
        },
      };
    },
    getAggregationConfig(key: string): AggregationsAggregationContainer {
      let configuration = store.aggregationConfig()[key];
      if (configuration) {
        return configuration;
      } else {
        let newConfiguration = this.buildDefaultAggregationConfig(key);
        store.aggregationConfig()[key] = newConfiguration;
        return newConfiguration;
      }
    },
    getAggregationSearchField(key: string): string {
      const aggregationConfig = store.aggregationConfig()[key];
      if (aggregationConfig as AggregationsTermsAggregation) {
        return aggregationConfig.terms?.field || key;
      } else {
        return key;
      }
    },
  })),
  withHooks({
    onInit({
      search,
      searchFilterParameters,
      paging,
      searchRequestPageParameters,
    }) {
      search(searchFilterParameters);
      paging(searchRequestPageParameters);
    },
  })
);

export type SearchStoreType = InstanceType<typeof SearchStore>;
