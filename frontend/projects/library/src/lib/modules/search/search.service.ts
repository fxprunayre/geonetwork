import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { elasticsearch, IndexRecord } from 'gn-api-client';
import { SearchService as ApiSearchService } from 'gn4-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { SearchRegistry, SearchStoreType } from './search.store';
import { SearchFilter, TRACK_TOTAL_HITS } from './search.store.model';
import { SEARCH_SOURCE } from './search.constant';
import { AggregationService } from './aggregation.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All searches running in current app.
  // Each search has its own context
  store: SearchRegistry = {};

  searchService: ApiSearchService = inject(ApiSearchService);

  aggregationService = inject(AggregationService);

  uiConfiguration = inject(APPLICATION_CONFIGURATION).config;

  register(searchId: string, searchStore: SearchStoreType) {
    if (this.store[searchId]) {
      console.log(`Search ${searchId} already registered. Reusing it.`);
      // throw new Error(
      //   `Search ${searchId} already registered. Choose another search id.`
      // );
    }
    this.store[searchId] = searchStore;
  }

  getSearch(searchId: string): SearchStoreType {
    if (this.store[searchId]) {
      return this.store[searchId];
    } else {
      throw new Error(
        `Search ${searchId} not found. Available search contexts are: ${Object.keys(this.store).join(', ')}`,
      );
    }
  }

  escapeSpecialCharacters(queryString: string) {
    return queryString.replace(/(\+|-|&&|\|\||!|\{|\}|\[|\]|\^|\~|\?|:|\\{1}|\(|\)|\/)/g, '\\$1');
  }

  buildQuery(
    query: string,
    filters: Record<string, SearchFilter>,
  ): elasticsearch.QueryDslQueryContainer {
    const filter = [
      {
        terms: {
          isTemplate: ['n'],
        },
      },
    ];
    const must: elasticsearch.QueryDslQueryContainer[] = [];
    if (query) {
      must.push({
        query_string: {
          query: this.escapeSpecialCharacters(query),
          default_operator: 'AND',
          fields: ['resourceTitleObject.*^5', 'any.*', 'uuid'],
        },
      });
    }
    for (const field of Object.keys(filters)) {
      must.push({
        terms: {
          [field]: filters[field].values,
        },
      });
    }
    const must_not: elasticsearch.QueryDslQueryContainer[] = [];
    const should: elasticsearch.QueryDslQueryContainer[] = [];
    return {
      bool: {
        must,
        must_not,
        should,
        filter,
      },
    };
  }

  buildSearchRequest(
    page: number,
    size: number,
    query: string,
    filters: { [p: string]: SearchFilter },
  ) {
    // TODO: add sorting
    return {
      from: page * size,
      size: size,
      track_total_hits: TRACK_TOTAL_HITS,
      query: this.buildQuery(query, filters),
      aggregations: this.aggregationService.buildAggregationQuery(
        this.uiConfiguration?.apps?.search?.aggregations ?? [],
      ),
      _source: SEARCH_SOURCE,
    };
  }

  buildIndexRecord(hit: elasticsearch.SearchHit<IndexRecord>): IndexRecord {
    // TODO: Handle multilingual fields
    return {
      ...hit._source,
      info: {
        _id: hit._id,
      },
    } as IndexRecord;
  }

  search(
    query: string,
    page: number = 0,
    size: number = 10,
    filters: Record<string, SearchFilter> = {},
  ): Observable<{
    results: IndexRecord[];
    aggregations: Record<string, elasticsearch.AggregationsAggregate> | {};
    totalCount: number;
  }> {
    return this.searchService.search(this.buildSearchRequest(page, size, query, filters)).pipe(
      map(
        (
          response: elasticsearch.SearchResponse<
            IndexRecord,
            Record<string, elasticsearch.AggregationsAggregate>
          >,
        ) => {
          return {
            results: response.hits.hits.map((hit) => {
              return this.buildIndexRecord(hit);
            }),
            aggregations: response.aggregations ?? {},
            totalCount: this.getTotalHits(response),
          };
        },
      ),
    );
  }

  private getTotalHits(
    response: elasticsearch.SearchResponse<
      IndexRecord,
      Record<string, elasticsearch.AggregationsAggregate>
    >,
  ) {
    let totalCount = 0;
    if (typeof response.hits.total === 'number') {
      totalCount = response.hits.total;
    } else if (
      response.hits.total &&
      typeof response.hits.total === 'object' &&
      'value' in response.hits.total
    ) {
      totalCount = response.hits.total.value;
    }
    return totalCount;
  }

  getById(id: string): Observable<IndexRecord | null> {
    let searchRequest: elasticsearch.SearchRequest = {
      query: {
        term: {
          _id: id,
        },
      },
      size: 1,
    };

    return this.searchService.search(searchRequest).pipe(
      map(
        (
          response: elasticsearch.SearchResponse<
            IndexRecord,
            Record<string, elasticsearch.AggregationsAggregate>
          >,
        ) => {
          const hits = response.hits.hits;

          if (hits.length === 0) {
            return null;
          }

          return this.buildIndexRecord(hits[0]);
        },
      ),
    );
  }
}
