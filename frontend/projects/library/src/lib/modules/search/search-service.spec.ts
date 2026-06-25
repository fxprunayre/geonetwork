import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { elasticsearch } from 'gn-api-client';
import { SearchService as ApiSearchService, RegistriesService } from 'gn4-api-client';
import { provideMockTranslateService } from '../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { SearchService } from './search-service';
import { SearchFilter } from './search-store.model';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockTranslateService(),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG as any) },
        {
          provide: ApiSearchService,
          useValue: jasmine.createSpyObj('ApiSearchService', ['search']),
        },
        {
          provide: RegistriesService,
          useValue: jasmine.createSpyObj('RegistriesService', ['getKeywords']),
        },
      ],
    });

    service = TestBed.inject(SearchService);
  });

  it('builds range filters for histogram aggregations when interval is not 1', () => {
    const filters: Record<string, SearchFilter> = {
      depth: { field: 'depth', values: [10, 20] },
    };

    const aggregationsConfig: (
      | string
      | Record<string, elasticsearch.AggregationsAggregationContainer>
    )[] = [
      {
        depth: {
          histogram: {
            field: 'depth',
            interval: 5,
          },
        },
      },
    ];

    const query = service.buildQuery('', [], filters, aggregationsConfig) as any;
    const shouldClauses = query.bool.must[0].bool.should;

    expect(shouldClauses).toEqual([
      { range: { depth: { gte: 10, lt: 15 } } },
      { range: { depth: { gte: 20, lt: 25 } } },
    ]);
    expect(query.bool.must[0].bool.minimum_should_match).toBe(1);
  });

  it('keeps terms filter for histogram aggregations when interval is 1', () => {
    const filters: Record<string, SearchFilter> = {
      depth: { field: 'depth', values: [10, 20] },
    };

    const aggregationsConfig: (
      | string
      | Record<string, elasticsearch.AggregationsAggregationContainer>
    )[] = [
      {
        depth: {
          histogram: {
            field: 'depth',
            interval: 1,
          },
        },
      },
    ];

    const query = service.buildQuery('', [], filters, aggregationsConfig) as any;

    expect(query.bool.must[0]).toEqual({
      terms: {
        depth: [10, 20],
      },
    });
  });
});
