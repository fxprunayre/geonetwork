import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { elasticsearch } from 'gn-api-client';
import { SearchService as ApiSearchService, RegistriesService } from 'gn4-api-client';
import { provideMockTranslateService } from '../../shared/translate-service.mock';
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
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        {
          provide: ApiSearchService,
          useValue: {
            search: vi.fn().mockName('ApiSearchService.search'),
          },
        },
        {
          provide: RegistriesService,
          useValue: {
            getKeywords: vi.fn().mockName('RegistriesService.getKeywords'),
          },
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

    const query = service.buildQuery('', [], filters, aggregationsConfig) as Record<
      string,
      unknown
    >;
    const boolClause = query['bool'] as Record<string, unknown>;
    const mustClause = boolClause['must'] as Record<string, unknown>[];
    const shouldClauses = (mustClause[0]['bool'] as Record<string, unknown>)['should'] as Record<
      string,
      unknown
    >[];

    expect(shouldClauses).toEqual([
      { range: { depth: { gte: 10, lt: 15 } } },
      { range: { depth: { gte: 20, lt: 25 } } },
    ]);
    expect((mustClause[0]['bool'] as Record<string, unknown>)['minimum_should_match']).toBe(1);
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

    const query = service.buildQuery('', [], filters, aggregationsConfig) as Record<
      string,
      unknown
    >;
    const boolClause = query['bool'] as Record<string, unknown>;
    const mustClause = boolClause['must'] as Record<string, unknown>[];

    expect(mustClause[0]).toEqual({
      terms: {
        depth: [10, 20],
      },
    });
  });

  it('sorts relevance by _score descending', () => {
    expect(service.buildSort('_score')).toEqual([{ _score: 'desc' }]);
  });

  it('wraps query with configured function score', () => {
    const query = service.buildSearchRequest({
      searchQuery: 'fish',
      filter: [],
      filters: {},
      aggregationsConfig: [],
      functionScore: {
        score_mode: 'multiply',
        boost_mode: 'multiply',
        functions: [
          {
            filter: { exists: { field: 'parentUuid' } },
            weight: 0.3,
          },
        ],
      },
      currentSort: '_score',
      currentPage: 0,
      pageSize: 10,
      layout: 'list',
    });

    const functionScore = (
      query.query as {
        function_score?: elasticsearch.QueryDslFunctionScoreQuery;
      }
    ).function_score;

    expect(functionScore).toBeDefined();
    expect(functionScore?.score_mode).toBe('multiply');
    expect(functionScore?.functions?.[0]).toEqual({
      filter: { exists: { field: 'parentUuid' } },
      weight: 0.3,
    });
  });

  it('sets min_score and knn query vector from search input', () => {
    const request = service.buildSearchRequest({
      searchQuery: 'marine protected areas',
      filter: [],
      filters: {
        resourceType: { field: 'resourceType', values: ['dataset'] },
      },
      aggregationsConfig: [],
      knn: {
        field: 'text_vector',
        query_vector: '',
        k: 10,
        num_candidates: 100,
      },
      minScore: 0.75,
      currentSort: '_score',
      currentPage: 0,
      pageSize: 10,
      layout: 'list',
    });

    expect((request as unknown as { min_score?: number }).min_score).toBe(0.75);

    const knn = (request as unknown as { knn?: Record<string, unknown> }).knn;
    expect(knn?.['field']).toBe('text_vector');
    expect(knn?.['query_vector']).toBe('marine protected areas');
    expect(knn?.['filter']).toBeDefined();
  });
});
