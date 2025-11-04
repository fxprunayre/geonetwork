/// <reference types="jasmine" />
import { signal } from '@angular/core';
import { SearchStoreType, initialState } from './search.store';
import { Observable, of } from 'rxjs';
import { SearchService } from './search.service';
import { IndexRecord } from 'gn-api-client';

// Define a consistent mock response for the searchService calls
const mockSearchResults: IndexRecord[] = [];
const mockTotalCount = 10;

export const createMockSearchStore = (): SearchStoreType => {
  const mockStore = {
    id: signal(initialState.id),
    routing: signal(initialState.routing),
    searchQuery: signal(initialState.searchQuery),
    filters: signal(initialState.filters),
    results: signal(mockSearchResults as any[]), // Mock the results signal
    totalCount: signal(mockTotalCount), // Mock the total count
    pageSize: signal(initialState.pageSize),
    currentPage: signal(initialState.currentPage),
    isLoading: signal(initialState.isLoading),
    aggregations: signal({
      resourceType: {
        terms: {
          field: 'resourceType',
          size: 10,
          exclude: 'map/.*',
        },
      },
    }),
    aggregationsConfig: signal(initialState.aggregationsConfig),

    // COMPUTED SELECTORS (Must be mocked as signals based on mock data)
    searchFilterParameters: signal({} as any),
    searchRequestPageParameters: signal({} as any),
    hasMore: signal(true),
    hasResults: signal(true),
    isEmpty: signal(false),
    totalPages: signal(1),

    // PROPS (MOCKING OBSERVABLES that the store uses internally)
    activeRoute: {} as any, // Mocked as empty or as needed
    results$: of(mockSearchResults) as Observable<any>,

    // --- MOCK METHODS (Must return Spies) ---
    init: jasmine.createSpy('init'),

    // rxMethods return void, but are spied upon
    search: jasmine.createSpy('search').and.callFake((params: any) => {
      console.log('Mock search called with params:', params);
    }),
    paging: jasmine.createSpy('paging').and.callFake((params: any) => {
      /* do nothing */
    }),

    setFullTextQuery: jasmine.createSpy('setFullTextQuery'),
    isFilterActive: jasmine.createSpy('isFilterActive').and.returnValue(false),
    addFilter: jasmine.createSpy('addFilter'),
    clearFilter: jasmine.createSpy('clearFilter'),
    removeFilter: jasmine.createSpy('removeFilter'),
    reset: jasmine.createSpy('reset'),
    more: jasmine.createSpy('more'),
    setPage: jasmine.createSpy('setPage'),
    next: jasmine.createSpy('next'),
    previous: jasmine.createSpy('previous'),
    setRouting: jasmine.createSpy('setRouting'),
    subscribeToRouteChange: jasmine.createSpy('subscribeToRouteChange'),
    setSort: jasmine.createSpy('setSort'),
  };

  return mockStore as any;
};

export function provideMockSearchService(mockStore?: SearchStoreType) {
  let mockSearchService: jasmine.SpyObj<SearchService>;
  mockSearchService = jasmine.createSpyObj('SearchService', ['getSearch', 'search', 'page']);
  mockSearchService.getSearch.and.returnValue(mockStore ?? createMockSearchStore());
  mockSearchService.search.and.returnValue(
    of({ results: mockSearchResults, aggregations: {}, totalCount: mockTotalCount }),
  );
  mockSearchService.page.and.returnValue(
    of({ results: mockSearchResults, aggregations: {}, totalCount: mockTotalCount }),
  );
  return { provide: SearchService, useValue: mockSearchService };
}
