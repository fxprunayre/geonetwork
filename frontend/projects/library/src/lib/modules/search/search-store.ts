import { computed, inject, untracked } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
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
import {
  AggregationsAggregationContainer,
  AggregationsStringTermsAggregate,
  elasticsearch,
} from 'gn-api-client';
import { debounceTime, distinctUntilChanged, filter, pipe, switchMap, tap } from 'rxjs';
import { AuthStore } from '../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_LANGUAGE } from '../config/gn-constants';
import { SearchAppLayout } from '../config/model/gnConfig';
import { SearchRouteService } from './search-route-service';
import { SearchService } from './search-service';
import {
  DEFAULT_AGGREGATION_SIZE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  DEFAULT_SORT_OPTIONS,
  SearchFilterParameters,
  SearchRequestPageParameters,
  SearchRequestParameters,
  SearchState,
} from './search-store.model';

export const initialState: SearchState = {
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
  aggregationsConfigTrigger: 0,
  aggregations: {},
  sort: DEFAULT_SORT_OPTIONS,
  currentSort: DEFAULT_SORT,
  isLoading: false,
  totalCount: 0,
  currentPage: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  language: DEFAULT_LANGUAGE,
  isAppendMode: false,
  layout: 'list',
};

export const SearchStore = signalStore(
  withState(initialState),
  withProps(({ results }) => ({
    activeRoute: inject(ActivatedRoute),
    router: inject(Router),
    results$: toObservable(results),
  })),
  withComputed((store) => {
    const authStore = inject(AuthStore);
    const apiConfiguration = inject(APPLICATION_CONFIGURATION);
    return {
      searchFilterParameters: computed(() => {
        // Trigger update when aggregationsConfigTrigger changes
        store.aggregationsConfigTrigger();
        // Trigger update when authentication state changes
        authStore.isAuthenticated();
        // Trigger update when space or catalogueUrl changes
        apiConfiguration().space;
        apiConfiguration().catalogueUrl;
        return {
          searchQuery: store.searchQuery(),
          filter: store.filter(),
          filters: store.filters(),
          currentSort: store.currentSort(),
          aggregationsConfig: untracked(store.aggregationsConfig),
          language: store.language(),
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
      hasActiveFilters: computed(() => {
        return Object.keys(store.filters()).length > 0;
      }),
      activeFilterCount: computed(() => {
        let count = 0;
        for (const [, filter] of Object.entries(store.filters())) {
          count += filter.values.length;
        }
        return count;
      }),
    };
  }),

  withMethods(
    (
      store,
      searchService = inject(SearchService),
      searchRouteService = inject(SearchRouteService),
    ) => {
      const setRouting = () => {
        if (!store.routing()) {
          return;
        }

        if (!searchRouteService.shouldUpdateStateFromRoute(store.router.url)) {
          return;
        }

        searchRouteService.setRoute(
          {
            currentPage: store.currentPage() || 0,
            pageSize: store.pageSize(),
            currentSort: store.currentSort(),
            searchQuery: store.searchQuery(),
            filter: store.filter(),
            filters: store.filters(),
            layout: store.layout(),
          } as SearchRequestParameters,
          store.pageSize(),
        );
      };

      const subscribeToRouteChange = () => {
        if (!store.routing()) {
          return;
        }

        store.activeRoute.queryParams.subscribe((params) => {
          if (!searchRouteService.shouldUpdateStateFromRoute(store.router.url)) {
            return;
          }

          const newState = searchRouteService.convertRouteParamsToSearch(
            params,
            store.pageSize(),
            store.currentSort(),
            store.layout(),
          );

          const currentState = {
            currentPage: store.currentPage(),
            pageSize: store.pageSize(),
            searchQuery: store.searchQuery(),
            filters: store.filters(),
            currentSort: store.currentSort(),
            layout: store.layout(),
          };

          if (JSON.stringify(newState) === JSON.stringify(currentState)) {
            return;
          }

          patchState(store, newState);
        });
      };

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
          sort: string[],
          currentSort: string,
          language: string,
        ) {
          console.log(`Initializing search store with id: ${searchId}`, aggregationsConfig);
          patchState(store, {
            id: searchId,
            aggregationsConfig,
            aggregationsConfigTrigger: store.aggregationsConfigTrigger() + 1,
            pageSize: size,
            routing,
            filter,
            sort: sort || DEFAULT_SORT_OPTIONS,
            currentSort: currentSort || DEFAULT_SORT,
            language: language || DEFAULT_LANGUAGE,
          });

          if (store.routing()) {
            subscribeToRouteChange();
          }
        },
        setLayout(layout: SearchAppLayout) {
          patchState(store, { layout });
          if (store.routing()) {
            setRouting();
          }
        },
        setLanguage(language: string) {
          patchState(store, { language: language });
        },
        search: rxMethod<SearchFilterParameters>(
          pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => {
              patchState(store, { isLoading: true });
              setRouting();
            }),
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
            filter(() => store.totalCount() > 0),
            distinctUntilChanged(),
            tap(() => {
              patchState(store, { isLoading: true });
              setRouting();
            }),
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
                        results: store.isAppendMode()
                          ? [...store.results(), ...response.results]
                          : response.results,
                        aggregations: store.aggregations(),
                        totalCount: response.totalCount,
                        isAppendMode: false,
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
          if (!filter) {
            return false;
          }
          // Handle number/string comparison properly. Integer values may be stored as strings in filters from URL.
          return filter.values.some((v) => v == value);
        },
        addFilter(
          field: string,
          value: string | number | (string | number)[],
          clear: boolean = false,
        ): void {
          const currentFilters = JSON.parse(JSON.stringify(store.filters())) || {};
          let targetFilter = currentFilters[field];

          const valuesToAdd = Array.isArray(value) ? value : [value];

          if (targetFilter) {
            if (clear) {
              targetFilter.values = [];
            }
            targetFilter.values.push(...valuesToAdd);
            targetFilter.values = [...new Set(targetFilter.values)];
          } else {
            currentFilters[field] = { field: field, values: valuesToAdd };
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
            // Handle number/string comparison properly. Integer values may be stored as strings in filters from URL.
            let clickedFilterIndex = currentValues.findIndex((v: string | number) => v == value);

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
        loadMore() {
          patchState(store, {
            isAppendMode: true,
            currentPage: store.currentPage() + 1,
          });
        },
        hasAggregationBuckets(field: string): boolean {
          const aggregationValues = store.aggregations()[field];

          if (!aggregationValues) {
            return false;
          }

          const buckets = (aggregationValues as any).buckets;
          return buckets !== undefined && buckets.length > 0;
        },
        hasMoreTerms(field: string): boolean {
          const aggregationValues = store.aggregations()[field];

          if (!aggregationValues) {
            return false;
          }

          return (aggregationValues as AggregationsStringTermsAggregate).sum_other_doc_count! > 0;
        },
        loadMoreTerms(field: string, size: number = 10) {
          let aggregationsConfig = JSON.parse(JSON.stringify(store.aggregationsConfig())) as (
            | string
            | Record<string, elasticsearch.AggregationsAggregationContainer>
          )[];
          const aggregation = aggregationsConfig.find((agg) => {
            if (typeof agg === 'string') {
              return agg === field;
            } else {
              return Object.keys(agg)[0] === field;
            }
          }) as Record<string, AggregationsAggregationContainer>;

          if (!aggregation || !aggregation[field].terms) {
            return;
          }

          aggregation[field].terms.size = (aggregation[field].terms.size || 10) + size;

          searchService
            .updateAggregation(field, {
              ...store.searchFilterParameters(),
              aggregationsConfig,
            } as SearchRequestParameters)
            .subscribe({
              next: (response) => {
                const aggregations = {
                  ...store.aggregations(),
                  ...response.aggregations,
                };

                patchState(store, {
                  aggregationsConfig: aggregationsConfig,
                  aggregations: aggregations,
                });
              },
              error: console.error,
            });
        },
        hasExpandedTerms(field: string): boolean {
          const aggregationsConfig = store.aggregationsConfig() as (
            | string
            | Record<string, elasticsearch.AggregationsAggregationContainer>
          )[];
          const aggregation = aggregationsConfig.find((agg) => {
            if (typeof agg === 'string') {
              return agg === field;
            } else {
              return Object.keys(agg)[0] === field;
            }
          }) as Record<string, AggregationsAggregationContainer>;

          if (!aggregation) {
            return false;
          }

          const layout = aggregation[field].meta?.layout || 'checkbox';
          if (
            !aggregation[field].terms ||
            layout !== 'checkbox' // tree, select, card do not support load more/less
          ) {
            return false;
          }

          return (
            (aggregation[field].terms.size || DEFAULT_AGGREGATION_SIZE) > DEFAULT_AGGREGATION_SIZE
          );
        },
        loadLessTerms(field: string, size: number = 10) {
          let aggregationsConfig = JSON.parse(JSON.stringify(store.aggregationsConfig())) as (
            | string
            | Record<string, elasticsearch.AggregationsAggregationContainer>
          )[];
          const aggregation = aggregationsConfig.find((agg) => {
            if (typeof agg === 'string') {
              return agg === field;
            } else {
              return Object.keys(agg)[0] === field;
            }
          }) as Record<string, AggregationsAggregationContainer>;

          if (!aggregation || !aggregation[field].terms) {
            return;
          }

          const currentSize = aggregation[field].terms.size || DEFAULT_AGGREGATION_SIZE;
          let newSize = currentSize - size;
          if (newSize < DEFAULT_AGGREGATION_SIZE) {
            newSize = DEFAULT_AGGREGATION_SIZE;
          }
          aggregation[field].terms.size = newSize;

          searchService
            .updateAggregation(field, {
              ...store.searchFilterParameters(),
              aggregationsConfig,
            } as SearchRequestParameters)
            .subscribe({
              next: (response) => {
                const aggregations = {
                  ...store.aggregations(),
                  ...response.aggregations,
                };

                patchState(store, {
                  aggregationsConfig: aggregationsConfig,
                  aggregations: aggregations,
                });
              },
              error: console.error,
            });
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
        setRouting,
        subscribeToRouteChange,
        setSort(currentSort: string) {
          patchState(store, { currentSort });
        },
        setAggregationsConfig(
          aggregationsConfig: (
            | string
            | Record<string, elasticsearch.AggregationsAggregationContainer>
          )[],
          silent: boolean = false,
        ) {
          patchState(store, {
            aggregationsConfig,
            aggregationsConfigTrigger: silent
              ? store.aggregationsConfigTrigger()
              : store.aggregationsConfigTrigger() + 1,
          });
        },
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
