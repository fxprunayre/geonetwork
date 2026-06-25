import { signal } from '@angular/core';
import { IndexRecord } from 'gn-api-client';
import { Observable, of } from 'rxjs';
import { SearchService } from './search-service';
import { SearchStoreType, initialState } from './search-store';

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
    hasError: signal(false),
    hasResults: signal(true),
    isEmpty: signal(false),
    totalPages: signal(1),

    // PROPS (MOCKING OBSERVABLES that the store uses internally)
    activeRoute: {} as any, // Mocked as empty or as needed
    results$: of(mockSearchResults) as Observable<any>,

    // --- MOCK METHODS (Must return Spies) ---
    init: vi.fn(),

    // rxMethods return void, but are spied upon
    search: vi.fn().mockImplementation((params: any) => {
      console.log('Mock search called with params:', params);
    }),
    paging: vi.fn().mockImplementation((params: any) => {
      /* do nothing */
    }),

    setFullTextQuery: vi.fn(),
    isFilterActive: vi.fn().mockReturnValue(false),
    addFilter: vi.fn(),
    clearFilter: vi.fn(),
    removeFilter: vi.fn(),
    reset: vi.fn(),
    more: vi.fn(),
    setPage: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    setRouting: vi.fn(),
    subscribeToRouteChange: vi.fn(),
    setSort: vi.fn(),
    hasMoreTerms: signal((keyName: string) => false),
    hasExpandedTerms: signal((keyName: string) => false),
    loadMoreTerms: vi.fn(),
    loadLessTerms: vi.fn(),
    hasActiveFilters: signal(false),
    activeFilterCount: signal(0),
    sort: signal([]),
    setSortOption: vi.fn(),
    currentSort: signal({ code: 'relevance', field: '_score' }),
  };

  return mockStore as any;
};

export function provideMockSearchService(mockStore?: SearchStoreType) {
  let mockSearchService = {
    getSearch: vi.fn().mockName('SearchService.getSearch'),
    search: vi.fn().mockName('SearchService.search'),
    page: vi.fn().mockName('SearchService.page'),
    getSupportedDatasource: vi.fn().mockName('SearchService.getSupportedDatasource'),
  };
  mockSearchService.getSearch.mockReturnValue(mockStore ?? createMockSearchStore());
  mockSearchService.search.mockReturnValue(
    of({ results: mockSearchResults, aggregations: {}, totalCount: mockTotalCount }),
  );
  mockSearchService.page.mockReturnValue(
    of({ results: mockSearchResults, aggregations: {}, totalCount: mockTotalCount }),
  );
  mockSearchService.getSupportedDatasource.mockReturnValue([]);
  return { provide: SearchService, useValue: mockSearchService };
}
