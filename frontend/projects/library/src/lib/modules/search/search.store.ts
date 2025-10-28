import { computed, inject, Injector } from '@angular/core';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
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
  SearchRequestParameters,
  SearchState,
} from './search.store.model';
import { SearchRouteService } from './search-route.service';
import { ActivatedRoute } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';

const initialState: SearchState = {
  id: 'default',
  routing: false,
  filter: {
    terms: {
      _isTemplate: 'n',
    },
  },
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
  withProps(({ results }) => ({
    activeRoute: inject(ActivatedRoute),
    results$: toObservable(results),
  })),
  withComputed((store) => ({
    searchFilterParameters: computed(() => {
      return {
        searchQuery: store.searchQuery(),
        filter: store.filter(),
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

  withMethods(
    (
      store,
      searchService = inject(SearchService),
      searchRouteService = inject(SearchRouteService),
    ) => {
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
          filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
        ) {
          console.log(`Initializing search store with id: ${searchId}`, aggregationsConfig);
          patchState(store, {
            id: searchId,
            aggregationsConfig,
            pageSize: size,
            routing,
            filter,
          });

          store.results$.subscribe(() => {
            if (store.results().length > 0) {
              this.setRouting();
            }
          });

          if (store.routing()) {
            this.subscribeToRouteChange();
          }
        },

        search: rxMethod<SearchFilterParameters>(
          pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => patchState(store, { isLoading: true })),
            switchMap((searchFilterParameters) => {
              patchState(store, {
                currentPage: 0,
                pageSize: store.pageSize(),
                results: [],
              });

              return searchService
                .search({
                  ...searchFilterParameters,
                  currentPage: store.currentPage() || 0,
                  pageSize: store.pageSize(),
                } as SearchRequestParameters)
                .pipe(
                  tapResponse({
                    next: (response) => {
                      const aggregationToKeep = Object.fromEntries(
                        Object.entries(store.aggregations()).filter(
                          ([key, agg]) => agg?.meta?.refreshPolicy === 'none',
                        ),
                      );

                      const aggregations = {
                        ...response.aggregations,
                        ...aggregationToKeep,
                      };

                      patchState(store, {
                        results: response.results,
                        aggregations: aggregations,
                        totalCount: response.totalCount,
                      });
                    },
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
            switchMap((searchRequestPageParameters) => {
              patchState(store, {
                currentPage: searchRequestPageParameters.currentPage,
                pageSize: searchRequestPageParameters.pageSize,
              });

              return searchService
                .page({
                  ...store.searchFilterParameters(),
                  ...searchRequestPageParameters,
                } as SearchRequestParameters)
                .pipe(
                  tapResponse({
                    next: (response) =>
                      patchState(store, {
                        results: response.results,
                        aggregations: store.aggregations(),
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
        clearFilter(field: string): void {
          const currentFilters = JSON.parse(JSON.stringify(store.filters())) || {};
          delete currentFilters[field];
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
        reset() {
          patchState(store, {
            searchQuery: '',
            filters: {},
          });
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
        setRouting() {
          if (!store.routing()) {
            return;
          }
          searchRouteService.setRoute(
            {
              currentPage: store.currentPage() || 0,
              pageSize: store.pageSize(),
              sort: store.sort(),
              searchQuery: store.searchQuery(),
              filter: store.filter(),
              filters: store.filters(),
            } as SearchRequestParameters,
            store.pageSize(),
          );
        },
        subscribeToRouteChange() {
          if (!store.routing()) {
            return;
          }

          store.activeRoute.queryParams.subscribe((params) => {
            patchState(
              store,
              searchRouteService.convertRouteParamsToSearch(params, store.pageSize()),
            );
          });
        },
        setSort(sort: elasticsearch.Sort) {
          patchState(store, { sort });
        }
      };
    },
),
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
