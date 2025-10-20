import { computed, inject, Injector } from '@angular/core';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { SearchService } from './search.service';
import { elasticsearch } from 'gn-api-client';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  SearchFilter,
  SearchFilterParameters,
  SearchRequestPageParameters,
  SearchState,
} from './search.store.model';

const initialState: SearchState = {
  id: 'default',
  routing: false,
  searchQuery: '',
  filters: {},
  results: [],
  aggregationsConfig: [],
  aggregations: {},
  sort: DEFAULT_SORT,
  isLoading: false,
  totalCount: 0,
  currentPage: 0,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const SearchStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    searchFilterParameters: computed(() => {
      return {
        searchQuery: store.searchQuery(),
        filters: store.filters(),
        sort: store.sort(),
        aggregationsConfig: store.aggregationsConfig(),
      } as SearchFilterParameters;
    }),
    searchRequestPageParameters: computed(() => {
      return {
        currentPage: store.currentPage(),
        pageSize: store.pageSize(),
      } as SearchRequestPageParameters;
    }),
    hasMore: computed(() => store.currentPage() + store.pageSize() < store.totalCount()),
    hasResults: computed(() => store.results().length > 0),
    isEmpty: computed(() => store.results().length === 0),
    totalPages: computed(() => Math.ceil(store.totalCount() / store.pageSize())),
  })),

  withMethods((store, searchService = inject(SearchService)) => {
    const injector = inject(Injector);

    return {
      init(
        searchId: string,
        aggregationsConfig: (
          | string
          | Record<string, elasticsearch.AggregationsAggregationContainer>
        )[],
        size: number,
        routing: boolean = false,
      ) {
        console.log(`Initializing search store with id: ${searchId}`);
        patchState(store, {
          id: searchId,
          aggregationsConfig,
          pageSize: size,
          routing,
        });
      },

      search: rxMethod<SearchFilterParameters>(
        pipe(
          debounceTime(300),
          distinctUntilChanged(),
          tap(() => patchState(store, { isLoading: true })),
          switchMap((searchFilterParameters) => {
            patchState(store, {
              currentPage: 0,
              pageSize: DEFAULT_PAGE_SIZE,
              results: [],
            });

            return searchService
              .getByQuery(
                searchFilterParameters.searchQuery,
                0,
                DEFAULT_PAGE_SIZE,
                searchFilterParameters.filters,
              )
              .pipe(
                tapResponse({
                  next: (response) =>
                    patchState(store, {
                      results: response.results,
                      aggregations: response.aggregations || {},
                      totalCount: response.totalCount,
                    }),
                  error: console.error,
                  finalize: () => patchState(store, { isLoading: false }),
                }),
              );
          }),
        ),
      ),

      paging: rxMethod<SearchRequestPageParameters>(
        pipe(
          distinctUntilChanged(),
          tap(() => patchState(store, { isLoading: true })),
          switchMap((searchResquestPageParameters) => {
            patchState(store, {
              currentPage: searchResquestPageParameters.currentPage,
              pageSize: searchResquestPageParameters.pageSize,
            });

            return searchService
              .getByQuery(
                store.searchQuery(),
                store.currentPage(),
                store.pageSize(),
                store.filters(),
              )
              .pipe(
                tapResponse({
                  next: (response) =>
                    patchState(store, {
                      results: response.results,
                      aggregations: response.aggregations || {},
                      totalCount: response.totalCount,
                    }),
                  error: console.error,
                  finalize: () => patchState(store, { isLoading: false }),
                }),
              );
          }),
        ),
      ),
      setFullTextQuery(value: string) {
        patchState(store, { searchQuery: value });
      },
      isFilterActive(field: string, value: string | number) {
        const filter = store.filters()[field];
        return filter?.values.includes(value);
      },
      addFilter(field: string, value: string | number): void {
        const currentFilters = JSON.parse(JSON.stringify(store.filters())) || {};
        let targetFilter = currentFilters[field];

        if (targetFilter) {
          targetFilter.values.push(value);
        } else {
          currentFilters[field] = { field: field, values: [value] };
        }

        patchState(store, {
          currentPage: 0,
          filters: currentFilters,
        });
      },
      removeFilter(field: string, value: string | number): void {
        const currentFilters = JSON.parse(JSON.stringify(store.filters())) || {};
        let targetFilter = currentFilters[field];

        if (targetFilter) {
          let currentValues = targetFilter.values;
          let clickedFilterIndex = currentValues.indexOf(value);

          if (clickedFilterIndex > -1) {
            currentValues.splice(clickedFilterIndex, 1);
          }

          // No more values for this filter
          if (currentValues.length === 0) {
            delete currentFilters[field];
          }

          patchState(store, {
            currentPage: 0,
            filters: currentFilters,
          });
        }
      },
      more(pageSize: number) {
        patchState(store, { currentPage: store.currentPage() + store.pageSize() });
      },
      setPage(currentPage: number, pageSize: number) {
        let results = JSON.parse(JSON.stringify(store.results()));
        if (results) {
          results = [];
        }
        patchState(store, { currentPage, pageSize, results });
      },
      next() {
        patchState(store, { currentPage: store.currentPage() + store.pageSize() });
      },
      previous() {
        patchState(store, { currentPage: store.currentPage() - store.pageSize() });
      },
    };
  }),
  withHooks({
    onInit({ search, searchFilterParameters, paging, searchRequestPageParameters }) {
      search(searchFilterParameters);
      paging(searchRequestPageParameters);
    },
  }),
);

export type SearchStoreType = InstanceType<typeof SearchStore>;

export interface SearchRegistry {
  [searchId: string]: SearchStoreType;
}
