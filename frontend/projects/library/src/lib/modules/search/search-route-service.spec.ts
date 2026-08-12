import { TestBed } from '@angular/core/testing';
import { elasticsearch } from 'gn-api-client';

import { SearchRouteService } from './search-route-service';

describe('SearchRoute', () => {
  let service: SearchRouteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchRouteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('converts from offset route param to page index', () => {
    const result = service.convertRouteParamsToSearch(
      { from: '40', size: '20' },
      20,
      '_score',
      'list',
      [] as elasticsearch.QueryDslQueryContainer[],
    );

    expect(result['currentPage']).toBe(2);
    expect(result['pageSize']).toBe(20);
  });

  it('converts page index to from offset route param', () => {
    const result = service.convertSearchToRouteParams({
      currentPage: 2,
      pageSize: 20,
      currentSort: '_score',
      searchQuery: '',
      filter: [] as elasticsearch.QueryDslQueryContainer[],
      filters: {},
      layout: 'list',
    });

    expect(result['from']).toBe('40');
    expect(result['size']).toBe('20');
  });
});
