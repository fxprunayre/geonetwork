import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { elasticsearch, IndexRecord, RelatedItemType } from 'gn-api-client';
import { SearchService as ApiSearchService } from 'gn4-api-client';
import { SearchRegistry, SearchStoreType } from './search.store';
import { SearchFilter, SearchRequestParameters, TRACK_TOTAL_HITS } from './search.store.model';
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

  register(searchId: string, searchStore: SearchStoreType) {
    if (this.store[searchId]) {
      console.log(`Search ${searchId} already registered. Reusing it.`);
      // throw new Error(
      //   `Search ${searchId} already registered. Choose another search id.`
      // );
    } else {
      this.store[searchId] = searchStore;
    }
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
    queryFilter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    filters: Record<string, SearchFilter>,
  ): elasticsearch.QueryDslQueryContainer {
    const filter = queryFilter;
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
    searchRequestParameters: SearchRequestParameters,
    withAggregation: boolean = true,
  ) {
    // TODO: add sorting
    let request: elasticsearch.SearchRequest = {
      from: searchRequestParameters.currentPage * searchRequestParameters.pageSize,
      size: searchRequestParameters.pageSize,
      track_total_hits: TRACK_TOTAL_HITS,
      query: this.buildQuery(
        searchRequestParameters.searchQuery,
        searchRequestParameters.filter,
        searchRequestParameters.filters,
      ),
      _source: SEARCH_SOURCE,
      sort: this.buildSort(searchRequestParameters.currentSort),
    };

    if (withAggregation) {
      request.aggregations = this.aggregationService.buildAggregationQuery(
        searchRequestParameters.aggregationsConfig ?? [],
      );
    }
    return request;
  }

  buildSort(currentSort: string): elasticsearch.SortCombinations[] {
    if (!currentSort) {
      return [];
    }
    const sort: elasticsearch.SortCombinations[] = [];
    const sortFields = currentSort.split(',');
    for (const field of sortFields) {
      const trimmedField = field.trim();
      if (trimmedField.startsWith('-')) {
        sort.push({ [trimmedField.substring(1)]: 'desc' });
      } else {
        sort.push({ [trimmedField]: 'asc' });
      }
    }
    return sort;
  }

  parseRelated(related: Record<string, elasticsearch.SearchHit<IndexRecord>[] | IndexRecord[]>) {
    const parsedRelated: Record<string, IndexRecord[]> = {};
    for (const key of Object.keys(related || {})) {
      parsedRelated[key] = (related[key] || []).map((item) => {
        if ('_source' in item) {
          return this.buildIndexRecord(item as elasticsearch.SearchHit<IndexRecord>);
        } else {
          return item as IndexRecord;
        }
      });
    }
    return parsedRelated;
  }

  buildIndexRecord(hit: elasticsearch.SearchHit<IndexRecord>): IndexRecord {
    // TODO: Handle multilingual fields
    const record = {
      ...hit._source,
      info: {
        _id: hit._id,
        view: hit.view,
        edit: hit.edit,
        selected: hit.selected,
        origin: hit.origin,
      },
    } as IndexRecord;

    if (hit.related) {
      record.related = this.parseRelated(hit.related);
    }
    const overview = hit.properties?.['overview'];
    if (overview) {
      // Related records have overview as string, not array of strings
      record.overview = [{ url: overview }];
    }
    return record;
  }

  search(searchRequestParameters: SearchRequestParameters): Observable<{
    results: IndexRecord[];
    aggregations: Record<string, elasticsearch.AggregationsAggregate> | {};
    totalCount: number;
  }> {
    return this.searchService.search(this.buildSearchRequest(searchRequestParameters)).pipe(
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

  page(searchRequestParameters: SearchRequestParameters): Observable<{
    results: IndexRecord[];
    totalCount: number;
  }> {
    return this.searchService.search(this.buildSearchRequest(searchRequestParameters, false)).pipe(
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

  getById(id: string, relatedTypes?: RelatedItemType[]): Observable<IndexRecord | null> {
    let searchRequest: elasticsearch.SearchRequest = {
      query: {
        term: {
          _id: id,
        },
      },
      size: 1,
    };

    return this.searchService.search(searchRequest, undefined, relatedTypes).pipe(
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

  async autocompleteSearch(query: string) {
    const request: elasticsearch.SearchRequest = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                type: 'bool_prefix' as any,
                fields: [
                  'resourceTitleObject.*^6',
                  'resourceAbstractObject.*^5',
                  'tag',
                  'uuid',
                  'resourceIdentifier',
                ],
              },
            },
            {
              terms: {
                isTemplate: ['n'],
              },
            },
          ],
        },
      },
      size: 20,
      sort: ['_score'],
      _source: ['resourceTitleObject.*', 'resourceType'],
    };

    const response: any = await this.searchService.search(request).toPromise();

    return response?.hits?.hits?.map((hit: any) => {
      const title = hit._source?.resourceTitleObject?.['default'];
      return {
        title,
        resourceType: hit._source?.resourceType,
      };
    }) ?? [];
  }

}
