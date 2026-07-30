import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { elasticsearch, IndexRecord, Link, RelatedItemType } from 'gn-api-client';
import { SearchService as ApiSearchService } from 'gn4-api-client';
import { map, Observable } from 'rxjs';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { Datasource } from '../data/datasource.model';
import { SearchQueryService } from './search-query.service';
import { SpatialBBox, SpatialFilterData, SpatialRelation } from './search-spatial.model';
import { SearchRegistry, SearchRequestParameters, SearchStoreContract } from './search-store.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All searches running in current app.
  // Each search has its own context
  store: SearchRegistry = {};

  searchService: ApiSearchService = inject(ApiSearchService);
  searchQueryService = inject(SearchQueryService);

  translateService = inject(TranslateService);
  appConfig = inject(APPLICATION_CONFIGURATION);

  register<TStore extends SearchStoreContract>(searchId: string, searchStore: TStore) {
    if (this.store[searchId]) {
      console.log(`Search ${searchId} already registered. Replacing with latest store instance.`);
    }

    // Always use the latest store instance for a scope.
    this.store[searchId] = searchStore;
  }

  getSearch<TStore extends SearchStoreContract = SearchStoreContract>(searchId: string): TStore {
    if (this.store[searchId]) {
      return this.store[searchId] as TStore;
    } else {
      throw new Error(
        `Search ${searchId} not found. Available search contexts are: ${Object.keys(this.store).join(', ')}`,
      );
    }
  }

  buildQuery(
    query: string,
    queryFilter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    filters: Record<string, import('./search-store.model').SearchFilter>,
    aggregationsConfig?: (
      | string
      | Record<string, elasticsearch.AggregationsAggregationContainer>
    )[],
  ): elasticsearch.QueryDslQueryContainer {
    return this.searchQueryService.buildQuery(query, queryFilter, filters, aggregationsConfig);
  }

  buildSearchRequest(searchRequestParameters: SearchRequestParameters, withAggregation = true) {
    return this.searchQueryService.buildSearchRequest(searchRequestParameters, withAggregation);
  }

  buildAggregationRequest(
    aggregationName: string,
    searchRequestParameters: SearchRequestParameters,
  ) {
    return this.searchQueryService.buildAggregationRequest(
      aggregationName,
      searchRequestParameters,
    );
  }

  buildSort(currentSort: string): elasticsearch.SortCombinations[] {
    return this.searchQueryService.buildSort(currentSort);
  }

  buildSpatialEnvelopeFilter(
    field: string,
    bbox: SpatialBBox,
    relation: SpatialRelation,
  ): elasticsearch.QueryDslQueryContainer {
    return this.searchQueryService.buildSpatialEnvelopeFilter(field, bbox, relation);
  }

  isSpatialEnvelopeFilter(filter: elasticsearch.QueryDslQueryContainer, field: string): boolean {
    return this.searchQueryService.isSpatialEnvelopeFilter(filter, field);
  }

  removeSpatialEnvelopeFilters(
    filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    field: string,
  ): elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[] {
    return this.searchQueryService.removeSpatialEnvelopeFilters(filter, field);
  }

  applySpatialEnvelopeFilter(
    filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    field: string,
    bbox: SpatialBBox,
    relation: SpatialRelation,
  ): elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[] {
    return this.searchQueryService.applySpatialEnvelopeFilter(filter, field, bbox, relation);
  }

  extractSpatialEnvelopeFilter(
    filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    field: string,
  ): SpatialFilterData | null {
    return this.searchQueryService.extractSpatialEnvelopeFilter(filter, field);
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

      if (key === 'siblings') {
        const remainingSiblings: IndexRecord[] = [];
        parsedRelated[key].forEach((record) => {
          // properties are merged in the record in buildIndexRecord
          const r = record;
          if (r['associationType'] && r['initiativeType']) {
            const siblingKey = `siblings_${r['associationType']}_${r['initiativeType']}`;
            if (!parsedRelated[siblingKey]) {
              parsedRelated[siblingKey] = [];
            }
            parsedRelated[siblingKey].push(record);
          } else {
            remainingSiblings.push(record);
          }
        });
        parsedRelated[key] = remainingSiblings;
      }
    }
    return parsedRelated;
  }

  isMultiLingualField(obj: unknown, fieldName: string): boolean {
    const isMultiLingualField =
      fieldName.endsWith('Object') ||
      fieldName.startsWith('cl_') ||
      fieldName.startsWith('th_') ||
      fieldName.startsWith('multilingual') ||
      fieldName === 'keywords' ||
      fieldName === 'allKeywords' ||
      fieldName === 'link';

    return isMultiLingualField;
  }

  /**
   * GeoNetwork store multilingual fields as objects with language codes as keys (eg. langeng, langfre)
   * and default property storing the default record language.
   * This method parses those fields recursively and set the default value with the current UI language if available.
   */
  parseTranslations(record: IndexRecord) {
    if (!record) return;

    // Get 3 char language code from current 2 char code
    const currentLang = this.translateService.getCurrentLang();
    let iso3Lang = 'eng'; // Default
    const languages = this.appConfig().config?.apps?.i18n?.languages;

    // languages is { "eng": "en", "fre": "fr" }
    if (languages) {
      const found = Object.keys(languages).find((key) => languages[key] === currentLang);
      if (found) {
        iso3Lang = found;
      }
    }

    const traverse = (obj: unknown, fieldName: string) => {
      if (!obj || typeof obj !== 'object') return;

      const keys = Object.keys(obj);

      if (this.isMultiLingualField(obj, fieldName)) {
        if (keys.includes('default')) {
          const targetKey = 'lang' + iso3Lang;
          const dict = obj as Record<string, unknown>;
          if (dict[targetKey]) {
            dict['default'] = dict[targetKey];
            return;
          }
        }
      }

      if (Array.isArray(obj)) {
        obj.forEach((item) => traverse(item, fieldName));
        return;
      }

      const dict = obj as Record<string, unknown>;
      keys.forEach((key) => {
        const value = dict[key];
        if (Array.isArray(value)) {
          value.forEach((item) => traverse(item, key));
        } else if (typeof value === 'object' && value !== null) {
          traverse(value, key);
        }
      });
    };

    traverse(record, '');
  }

  buildIndexRecord(hit: elasticsearch.SearchHit<IndexRecord>): IndexRecord {
    const record = {
      ...hit._source,
      ...hit.properties, // Related records
      info: {
        _id: hit._id,
        view: hit.view,
        edit: hit.edit,
        selected: hit.selected,
        origin: hit.origin,
        hasDataModel:
          hit._source?.featureTypes !== undefined && hit._source.featureTypes.length > 0,
        hasDatasource: this.checkHasDatasource(hit._source),
      },
    } as IndexRecord;

    this.parseTranslations(record);

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

  getSupportedDatasource(record: IndexRecord): Datasource[] {
    if (!record?.link) return [];

    return record.link.reduce((acc: Datasource[], link: Link) => {
      const url = link.urlObject?.['default'] || '';
      const protocol = link.protocol || '';
      const extension = url.split('.').pop()?.toLowerCase();

      if (protocol.startsWith('OGC:WFS')) {
        const layerName = link.nameObject?.['default'] || '';
        acc.push({ url, format: 'wfs', layer: layerName });
      } else if (protocol.startsWith('WWW:DOWNLOAD')) {
        const formatMapping: Record<string, Datasource['format']> = {
          arrow: 'arrow',
          parquet: 'parquet',
          csv: 'csv',
          gml: 'gml',
          xlsx: 'xlsx',
        };
        if (extension && formatMapping[extension]) {
          acc.push({ url, format: formatMapping[extension] });
        } else if (extension === 'json' || url.includes('f=pjson')) {
          acc.push({ url, format: 'json' });
        }
      }
      return acc;
    }, []);
  }

  private checkHasDatasource(record: IndexRecord | undefined): boolean {
    if (!record) return false;
    return this.getSupportedDatasource(record).length > 0;
  }

  search(searchRequestParameters: SearchRequestParameters): Observable<{
    results: IndexRecord[];
    aggregations: Record<string, elasticsearch.AggregationsAggregate> | Record<string, never>;
    totalCount: number;
  }> {
    return this.searchService
      .search(this.searchQueryService.buildSearchRequest(searchRequestParameters))
      .pipe(
        map(
          (
            response: elasticsearch.SearchResponse<
              IndexRecord,
              Record<string, elasticsearch.AggregationsAggregate>
            >,
          ) => {
            if (!response || !response.hits || !response.hits.hits) {
              throw new Error('Search API returned invalid or empty content.');
            }
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
    return this.searchService
      .search(this.searchQueryService.buildSearchRequest(searchRequestParameters, false))
      .pipe(
        map(
          (
            response: elasticsearch.SearchResponse<
              IndexRecord,
              Record<string, elasticsearch.AggregationsAggregate>
            >,
          ) => {
            if (!response || !response.hits || !response.hits.hits) {
              throw new Error('Search API returned invalid or empty content.');
            }
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

  updateAggregation(
    aggregationName: string,
    searchRequestParameters: SearchRequestParameters,
  ): Observable<{
    aggregations: Record<string, elasticsearch.AggregationsAggregate> | Record<string, never>;
  }> {
    return this.searchService
      .search(this.buildAggregationRequest(aggregationName, searchRequestParameters))
      .pipe(
        map(
          (
            response: elasticsearch.SearchResponse<
              IndexRecord,
              Record<string, elasticsearch.AggregationsAggregate>
            >,
          ) => {
            return {
              aggregations: response.aggregations ?? {},
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
    const searchRequest: elasticsearch.SearchRequest = {
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
          if (!response || !response.hits) {
            throw new Error('Search API returned invalid or empty content.');
          }

          const hits = response.hits.hits;

          if (hits.length === 0) {
            return null;
          }

          return this.buildIndexRecord(hits[0]);
        },
      ),
    );
  }

  async autocompleteSearch(
    query: string,
    contextFilter?: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
  ) {
    const filter = Array.isArray(contextFilter)
      ? contextFilter
      : contextFilter
        ? [contextFilter]
        : undefined;

    const request: elasticsearch.SearchRequest = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                type: 'bool_prefix',
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
          ...(filter ? { filter } : {}),
        },
      },
      size: 20,
      sort: ['_score'],
      _source: ['resourceTitleObject.*', 'resourceType'],
    };

    const response = (await this.searchService.search(request).toPromise()) as
      | elasticsearch.SearchResponse<IndexRecord>
      | undefined;

    return (
      response?.hits?.hits?.map((hit: elasticsearch.SearchHit<IndexRecord>) => {
        const title = hit._source?.resourceTitleObject?.['default'];
        return {
          title,
          resourceType: hit._source?.resourceType,
        };
      }) ?? []
    );
  }
}
