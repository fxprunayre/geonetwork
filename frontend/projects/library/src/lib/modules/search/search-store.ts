import { computed, inject, untracked } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
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
import { TranslateService } from '@ngx-translate/core';
import { elasticsearch } from 'gn-api-client';
import { MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, filter, pipe, switchMap, tap } from 'rxjs';
import { AuthStore } from '../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { SearchAppLayout } from '../config/model/gnConfig';
import { DEFAULT_LANGUAGE } from '../i18n/config/i18n-config';
import { AggregationStore } from './aggregation-store';
import { FilterStore } from './filter-store';
import { SearchRouteService } from './search-route-service';
import { SearchRouteSyncService } from './search-route-sync.service';
import { SearchService } from './search-service';
import {
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
    term: {
      _isTemplate: 'n',
    },
  },
  searchQuery: '',
  results: [],
  sort: DEFAULT_SORT_OPTIONS,
  currentSort: DEFAULT_SORT,
  isLoading: false,
  totalCount: 0,
  currentPage: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  language: DEFAULT_LANGUAGE,
  isAppendMode: false,
  layout: 'list',
  hasError: false,
};

export const SearchStore = signalStore(
  withState(initialState),
  withProps((store) => ({
    filterStore: inject(FilterStore),
    aggStore: inject(AggregationStore),
    routeSync: inject(SearchRouteSyncService),
    searchService: inject(SearchService),
    searchRouteService: inject(SearchRouteService),
    messageService: inject(MessageService),
    translateService: inject(TranslateService),
    results$: toObservable(store.results),
  })),
  withComputed((store) => {
    const authStore = inject(AuthStore);
    const apiConfiguration = inject(APPLICATION_CONFIGURATION);
    const hasSpatialFilter = computed(
      () => !!store.searchService.extractSpatialEnvelopeFilter(store.filter(), 'geom'),
    );
    return {
      hasSpatialFilter,
      searchFilterParameters: computed(() => {
        store.aggStore.aggregationsConfigTrigger();
        authStore.isAuthenticated();
        const _space = apiConfiguration().space;
        const _catalogueUrl = apiConfiguration().catalogueUrl;
        return {
          searchQuery: store.searchQuery(),
          filter: store.filter(),
          filters: store.filterStore.filters(),
          currentSort: store.currentSort(),
          aggregationsConfig: untracked(store.aggStore.aggregationsConfig),
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
      hasActiveFilters: computed(() => store.filterStore.hasActiveFilters() || hasSpatialFilter()),
      activeFilterCount: computed(
        () => store.filterStore.activeFilterCount() + (hasSpatialFilter() ? 1 : 0),
      ),
      aggregations: computed(() => store.aggStore.aggregations()),
      aggregationsConfig: computed(() => store.aggStore.aggregationsConfig()),
      aggregationsConfigTrigger: computed(() => store.aggStore.aggregationsConfigTrigger()),
      filters: computed(() => store.filterStore.filters()),
    };
  }),

  withMethods((store) => {
    const setRouting = () => {
      if (!store.routing()) {
        return;
      }

      if (
        !store.routeSync.searchRouteService.shouldUpdateStateFromRoute(store.routeSync.router.url)
      ) {
        return;
      }

      store.routeSync.searchRouteService.setRoute(
        {
          currentPage: store.currentPage() || 0,
          pageSize: store.pageSize(),
          currentSort: store.currentSort(),
          searchQuery: store.searchQuery(),
          filter: store.filter(),
          filters: store.filterStore.filters(),
          layout: store.layout(),
        } as SearchRequestParameters,
        store.pageSize(),
      );
    };

    const subscribeToRouteChange = () => {
      if (!store.routing()) {
        return;
      }

      store.routeSync.activeRoute.queryParams.subscribe((params) => {
        if (
          !store.routeSync.searchRouteService.shouldUpdateStateFromRoute(store.routeSync.router.url)
        ) {
          return;
        }

        const newState = store.routeSync.searchRouteService.convertRouteParamsToSearch(
          params,
          store.pageSize(),
          store.currentSort(),
          store.layout(),
          store.filter(),
        );

        const currentState = {
          currentPage: store.currentPage(),
          pageSize: store.pageSize(),
          searchQuery: store.searchQuery(),
          filter: store.filter(),
          filters: store.filterStore.filters(),
          currentSort: store.currentSort(),
          layout: store.layout(),
        };

        if (JSON.stringify(newState) === JSON.stringify(currentState)) {
          return;
        }

        const { filters, ...searchStateUpdate } = newState as {
          filters?: SearchFilterParameters['filters'];
        } & Record<string, unknown>;

        patchState(store, searchStateUpdate);

        store.filterStore.setFilters(filters || {});
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
        routing = false,
        filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
        sort: string[],
        currentSort: string,
        language: string,
        layout: SearchAppLayout,
      ) {
        console.log(`Initializing search store with id: ${searchId}`, aggregationsConfig);
        store.aggStore.setAggregationsConfig(aggregationsConfig);
        patchState(store, {
          id: searchId,
          pageSize: size,
          routing,
          filter,
          sort: sort || DEFAULT_SORT_OPTIONS,
          currentSort: currentSort || DEFAULT_SORT,
          language: language || DEFAULT_LANGUAGE,
          layout,
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
            patchState(store, { isLoading: true, hasError: false });
            setRouting();
          }),
          switchMap((searchFilterParameters) => {
            patchState(store, {
              currentPage: 0,
              pageSize: store.pageSize(),
              results: [],
            });
            return store.searchService
              .search({
                ...searchFilterParameters,
                currentPage: store.currentPage() || 0,
                pageSize: store.pageSize(),
              } as SearchRequestParameters)
              .pipe(
                tapResponse({
                  next: (response) => {
                    const currentFilters = store.filterStore.filters();
                    const aggregationToKeep = Object.fromEntries(
                      Object.entries(store.aggStore.aggregations()).filter(([key, agg]) => {
                        const hasActiveFilter = (currentFilters[key]?.values?.length || 0) > 0;
                        return agg?.meta?.refreshPolicy === 'none' && hasActiveFilter;
                      }),
                    );

                    const aggregations = {
                      ...response.aggregations,
                      ...aggregationToKeep,
                    };

                    patchState(store, {
                      results: response.results,
                      totalCount: response.totalCount,
                    });
                    store.aggStore.setAggregations(aggregations);
                  },
                  error: (err) => {
                    console.error(err);
                    patchState(store, { hasError: true });
                    store.messageService.add({
                      severity: 'error',
                      summary: store.translateService.instant('shared.error') || 'Error',
                      detail:
                        store.translateService.instant('search.notAvailable') ||
                        'Search is currently not available.',
                      life: 10000,
                    });
                  },
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
            patchState(store, { isLoading: true, hasError: false });
            setRouting();
          }),
          switchMap((searchRequestPageParameters) => {
            patchState(store, {
              currentPage: searchRequestPageParameters.currentPage,
              pageSize: searchRequestPageParameters.pageSize,
            });

            return store.searchService
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
                      totalCount: response.totalCount,
                      isAppendMode: false,
                    }),
                  error: (err) => {
                    console.error(err);
                    patchState(store, { hasError: true });
                    store.messageService.add({
                      severity: 'error',
                      summary: store.translateService.instant('shared.error') || 'Error',
                      detail:
                        store.translateService.instant('search.notAvailable') ||
                        'Search is currently not available.',
                      life: 10000,
                    });
                  },
                  finalize: () => patchState(store, { isLoading: false }),
                }),
              );
          }),
        ),
      ),
      setFullTextQuery(value: string) {
        patchState(store, { searchQuery: value });
      },
      setFilter(
        filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
      ) {
        patchState(store, {
          currentPage: 0,
          filter,
        });
      },
      isFilterActive(field: string, value: string | number) {
        return store.filterStore.isFilterActive(field, value);
      },
      addFilter(field: string, value: string | number | (string | number)[], clear = false): void {
        store.filterStore.addFilter(field, value, clear);
        patchState(store, { currentPage: 0 });
      },
      clearFilter(field: string): void {
        store.filterStore.clearFilter(field);
        patchState(store, { currentPage: 0 });
      },
      removeFilter(field: string, value: string | number): void {
        store.filterStore.removeFilter(field, value);
        patchState(store, { currentPage: 0 });
      },
      reset() {
        const filterWithoutSpatial = store.searchService.removeSpatialEnvelopeFilters(
          store.filter(),
          'geom',
        );
        store.filterStore.reset();
        patchState(store, { searchQuery: '', filter: filterWithoutSpatial, currentPage: 0 });
      },
      more(_pageSize: number) {
        patchState(store, { currentPage: store.currentPage() + store.pageSize() });
      },
      loadMore() {
        patchState(store, {
          isAppendMode: true,
          currentPage: store.currentPage() + 1,
        });
      },
      hasAggregationBuckets(field: string): boolean {
        return store.aggStore.hasAggregationBuckets(field);
      },
      hasMoreTerms(field: string): boolean {
        return store.aggStore.hasMoreTerms(field);
      },
      loadMoreTerms(field: string, size = 10) {
        store.aggStore.loadMoreTerms(field, store.searchFilterParameters(), size);
      },
      hasExpandedTerms(field: string): boolean {
        return store.aggStore.hasExpandedTerms(field);
      },
      loadLessTerms(field: string, size = 10) {
        store.aggStore.loadLessTerms(field, store.searchFilterParameters(), size);
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
        silent = false,
      ) {
        store.aggStore.setAggregationsConfig(aggregationsConfig, silent);
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
