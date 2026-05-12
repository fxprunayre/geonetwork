import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { elasticsearch, IndexRecord, Link, RelatedItemType } from 'gn-api-client';
import { SearchService as ApiSearchService } from 'gn4-api-client';
import { map, Observable } from 'rxjs';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { Datasource } from '../data/datasource.model';
import { AggregationService } from '../search-filter/aggregation-service';
import { SEARCH_SOURCE } from './search-constant';
import { SearchRegistry, SearchStoreType } from './search-store';
import { SearchFilter, SearchRequestParameters, TRACK_TOTAL_HITS } from './search-store.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // All searches running in current app.
  // Each search has its own context
  store: SearchRegistry = {};

  searchService: ApiSearchService = inject(ApiSearchService);

  translateService = inject(TranslateService);
  appConfig = inject(APPLICATION_CONFIGURATION);

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
    aggregationsConfig?: (
      | string
      | Record<string, elasticsearch.AggregationsAggregationContainer>
    )[],
  ): elasticsearch.QueryDslQueryContainer {
    const filter = queryFilter;
    const must: elasticsearch.QueryDslQueryContainer[] = [];
    if (query) {
      const elasticQueryRegexTemplate = /q\((.*)\)/;
      const isElasticQuery = query.match(elasticQueryRegexTemplate);
      if (isElasticQuery) {
        must.push({
          query_string: {
            query: query.replace(elasticQueryRegexTemplate, '$1').trim(),
          },
        });
      } else {
        must.push({
          query_string: {
            query: this.escapeSpecialCharacters(query),
            default_operator: 'AND',
            fields: ['resourceTitleObject.*^5', 'any.*', 'uuid'],
          },
        });
      }
    }
    for (const field of Object.keys(filters)) {
      let isFiltersAgg = false;
      const matchedFilters: elasticsearch.QueryDslQueryContainer[] = [];
      let aggDef: elasticsearch.AggregationsAggregationContainer | undefined;

      if (aggregationsConfig) {
        aggDef = this.aggregationService.getAggregationConfig(field, aggregationsConfig);
        if (aggDef && aggDef['filters'] && aggDef['filters']['filters']) {
          isFiltersAgg = true;
          const aggFilters = aggDef['filters']['filters'] as Record<
            string,
            elasticsearch.QueryDslQueryContainer
          >;
          for (const val of filters[field].values) {
            const v = String(val);
            if (aggFilters[v]) {
              matchedFilters.push(aggFilters[v]);
            }
          }
        }
      }

      if (isFiltersAgg) {
        if (matchedFilters.length > 0) {
          must.push({
            bool: {
              should: matchedFilters,
            },
          });
        }
      } else {
        const histogramInterval = aggDef?.histogram?.interval;
        const isHistogramWithCustomInterval =
          typeof histogramInterval === 'number' && histogramInterval !== 1;

        if (isHistogramWithCustomInterval) {
          const rangeFilters = filters[field].values
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value))
            .map((from) => ({
              range: {
                [field]: {
                  gte: from,
                  lt: from + histogramInterval,
                },
              },
            }));

          if (rangeFilters.length > 0) {
            must.push({
              bool: {
                should: rangeFilters,
                minimum_should_match: 1,
              },
            });
            continue;
          }
        }

        const termQuery = {
          terms: {
            [field]: filters[field].values,
          },
        };
        must.push(termQuery);
      }
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
    let request: elasticsearch.SearchRequest = {
      from: searchRequestParameters.currentPage * searchRequestParameters.pageSize,
      size: searchRequestParameters.pageSize,
      track_total_hits: TRACK_TOTAL_HITS,
      query: this.buildQuery(
        searchRequestParameters.searchQuery,
        searchRequestParameters.filter,
        searchRequestParameters.filters,
        searchRequestParameters.aggregationsConfig,
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

  buildAggregationRequest(
    aggregationName: string,
    searchRequestParameters: SearchRequestParameters,
  ) {
    let request: elasticsearch.SearchRequest = {
      from: 0,
      size: 0,
      track_total_hits: TRACK_TOTAL_HITS,
      query: this.buildQuery(
        searchRequestParameters.searchQuery,
        searchRequestParameters.filter,
        searchRequestParameters.filters,
        searchRequestParameters.aggregationsConfig,
      ),
    };

    request.aggregations = {
      [aggregationName]: this.aggregationService.buildAggregationQuery(
        searchRequestParameters.aggregationsConfig ?? [],
      )[aggregationName],
    };

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

      if (key === 'siblings') {
        const remainingSiblings: IndexRecord[] = [];
        parsedRelated[key].forEach((record) => {
          // properties are merged in the record in buildIndexRecord
          const r = record as any;
          if (r.associationType && r.initiativeType) {
            const siblingKey = `siblings_${r.associationType}_${r.initiativeType}`;
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

  isMultiLingualField(obj: any, fieldName: string): boolean {
    const keys = Object.keys(obj);
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

    const traverse = (obj: any, fieldName: string) => {
      if (!obj || typeof obj !== 'object') return;

      const keys = Object.keys(obj);

      if (this.isMultiLingualField(obj, fieldName)) {
        if (keys.includes('default')) {
          const targetKey = 'lang' + iso3Lang;
          if (obj[targetKey]) {
            obj['default'] = obj[targetKey];
            return;
          }
        }
      }

      if (Array.isArray(obj)) {
        obj.forEach((item) => traverse(item, fieldName));
        return;
      }

      keys.forEach((key) => {
        const value = obj[key];
        if (Array.isArray(value)) {
          value.forEach((item) => traverse(item, key));
        } else if (typeof value === 'object') {
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
        const formatMapping: { [key: string]: Datasource['format'] } = {
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

  updateAggregation(
    aggregationName: string,
    searchRequestParameters: SearchRequestParameters,
  ): Observable<{
    aggregations: Record<string, elasticsearch.AggregationsAggregate> | {};
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

    return (
      response?.hits?.hits?.map((hit: any) => {
        const title = hit._source?.resourceTitleObject?.['default'];
        return {
          title,
          resourceType: hit._source?.resourceType,
        };
      }) ?? []
    );
  }
}
