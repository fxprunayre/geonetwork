import { inject, Injectable } from '@angular/core';
import { elasticsearch } from 'gn-api-client';
import { AggregationService } from '../search-filter/aggregation-service';
import { SEARCH_SOURCE } from './search-constant';
import { SpatialBBox, SpatialFilterData, SpatialRelation } from './search-spatial.model';
import { SearchFilter, SearchRequestParameters, TRACK_TOTAL_HITS } from './search-store.model';

@Injectable({
  providedIn: 'root',
})
export class SearchQueryService {
  private readonly aggregationService = inject(AggregationService);

  escapeSpecialCharacters(queryString: string) {
    return queryString.replace(/(\+|-|&&|\|\||!|\{|\}|\[|\]|\^|~|\?|:|\\{1}|\(|\)|\/)/g, '\\$1');
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
    const baseQuery: elasticsearch.QueryDslQueryContainer = {
      bool: {
        must,
        must_not,
        should,
        filter,
      },
    };

    const spatialFilter = this.extractSpatialEnvelopeFilter(queryFilter, 'geom');
    if (!spatialFilter) {
      return baseQuery;
    }

    const centerLon = (spatialFilter.bbox.west + spatialFilter.bbox.east) / 2;
    const centerLat = (spatialFilter.bbox.south + spatialFilter.bbox.north) / 2;
    const queryWidthDeg = Math.abs(spatialFilter.bbox.east - spatialFilter.bbox.west);
    const queryHeightDeg = Math.abs(spatialFilter.bbox.north - spatialFilter.bbox.south);
    const queryAreaDeg = Math.max(queryWidthDeg * queryHeightDeg, 0.000001);

    const scoringQuery = {
      function_score: {
        query: baseQuery,
        score_mode: 'sum',
        boost_mode: 'sum',
        functions: [
          {
            filter: {
              exists: {
                field: 'location',
              },
            },
            gauss: {
              location: {
                origin: `${centerLat},${centerLon}`,
                scale: '600km',
                offset: '0km',
                decay: 0.6,
              },
            },
            weight: 2,
          },
          {
            script_score: {
              script: {
                source: `
                  if (params['_source'] == null) {
                    return 0.0;
                  }

                  def geomItems = [];
                  if (params['_source'].containsKey('geom')) {
                    def rawGeom = params['_source']['geom'];
                    if (rawGeom instanceof List) {
                      geomItems = rawGeom;
                    } else if (rawGeom != null) {
                      geomItems.add(rawGeom);
                    }
                  }

                  def locationItems = [];
                  if (params['_source'].containsKey('location')) {
                    def rawLocation = params['_source']['location'];
                    if (rawLocation instanceof List) {
                      locationItems = rawLocation;
                    } else if (rawLocation != null) {
                      locationItems.add(rawLocation);
                    }
                  }

                  int geomCount = geomItems.size();
                  int locationCount = locationItems.size();
                  int pairCount = geomCount > locationCount ? geomCount : locationCount;
                  if (pairCount == 0) {
                    return 0.0;
                  }

                  double bestScore = 0.0;
                  for (int i = 0; i < pairCount; i++) {
                    def geom = i < geomItems.size() ? geomItems[i] : null;
                    def location = i < locationItems.size() ? locationItems[i] : null;

                    double docCenterLon = Double.NaN;
                    double docCenterLat = Double.NaN;
                    double docArea = 0.0;
                    double docWest = Double.NaN;
                    double docSouth = Double.NaN;
                    double docEast = Double.NaN;
                    double docNorth = Double.NaN;

                    if (location instanceof Map) {
                      if (
                        location.containsKey('lon') &&
                        location.containsKey('lat') &&
                        location['lon'] instanceof Number &&
                        location['lat'] instanceof Number
                      ) {
                        docCenterLon = (double) location['lon'];
                        docCenterLat = (double) location['lat'];
                      }
                    } else if (location instanceof List) {
                      if (
                        location.size() >= 2 &&
                        location[0] instanceof Number &&
                        location[1] instanceof Number
                      ) {
                        docCenterLon = (double) location[0];
                        docCenterLat = (double) location[1];
                      }
                    }

                    if (geom instanceof Map && geom.containsKey('type') && geom.containsKey('coordinates')) {
                      def geomType = geom['type'];
                      def coords = geom['coordinates'];

                      if (geomType == 'Point') {
                        if (
                          coords instanceof List &&
                          coords.size() >= 2 &&
                          coords[0] instanceof Number &&
                          coords[1] instanceof Number
                        ) {
                          if (Double.isNaN(docCenterLon) || Double.isNaN(docCenterLat)) {
                            docCenterLon = (double) coords[0];
                            docCenterLat = (double) coords[1];
                          }
                          docWest = (double) coords[0];
                          docEast = (double) coords[0];
                          docSouth = (double) coords[1];
                          docNorth = (double) coords[1];
                          docArea = 0.0;
                        }
                      } else if (coords instanceof List && !coords.isEmpty()) {
                        def ring = coords[0];
                        if (
                          ring instanceof List &&
                          ring.size() >= 3 &&
                          ring[0] instanceof List &&
                          ring[2] instanceof List
                        ) {
                          def p0 = ring[0];
                          def p2 = ring[2];
                          if (
                            p0.size() >= 2 &&
                            p2.size() >= 2 &&
                            p0[0] instanceof Number &&
                            p0[1] instanceof Number &&
                            p2[0] instanceof Number &&
                            p2[1] instanceof Number
                          ) {
                            double west = (double) p0[0];
                            double south = (double) p0[1];
                            double east = (double) p2[0];
                            double north = (double) p2[1];

                            docWest = Math.min(west, east);
                            docEast = Math.max(west, east);
                            docSouth = Math.min(south, north);
                            docNorth = Math.max(south, north);

                            if (Double.isNaN(docCenterLon) || Double.isNaN(docCenterLat)) {
                              docCenterLon = (docWest + docEast) / 2.0;
                              docCenterLat = (docSouth + docNorth) / 2.0;
                            }

                            double docWidth = Math.abs(docEast - docWest);
                            double docHeight = Math.abs(docNorth - docSouth);
                            docArea = Math.max(docWidth * docHeight, 0.0);
                          }
                        }
                      }
                    }

                    if (Double.isNaN(docCenterLon) || Double.isNaN(docCenterLat)) {
                      continue;
                    }

                    double dx = docCenterLon - params.queryCenterLon;
                    double dy = docCenterLat - params.queryCenterLat;
                    double centerDistanceDeg = Math.sqrt(dx * dx + dy * dy);
                    double centerScore = Math.exp(-centerDistanceDeg / params.centerSigmaDeg);

                    double areaRatio = Math.max(docArea, 0.000001) / params.queryAreaDeg;
                    double areaScore = Math.exp(-Math.abs(Math.log(areaRatio)) / params.areaLogSigma);

                    double overlapScore = 0.0;
                    if (
                      !Double.isNaN(docWest) &&
                      !Double.isNaN(docEast) &&
                      !Double.isNaN(docSouth) &&
                      !Double.isNaN(docNorth)
                    ) {
                      double overlapWidth = Math.max(
                        0.0,
                        Math.min(docEast, params.queryEast) - Math.max(docWest, params.queryWest)
                      );
                      double overlapHeight = Math.max(
                        0.0,
                        Math.min(docNorth, params.queryNorth) - Math.max(docSouth, params.querySouth)
                      );
                      double overlapArea = overlapWidth * overlapHeight;
                      overlapScore = overlapArea / Math.max(docArea, 0.000001);
                    }

                    double combined =
                      (params.centerWeight * centerScore +
                        params.areaWeight * areaScore +
                        params.overlapWeight * overlapScore) /
                      (params.centerWeight + params.areaWeight + params.overlapWeight);

                    if (combined > bestScore) {
                      bestScore = combined;
                    }
                  }

                  return bestScore;
                `,
                params: {
                  queryCenterLon: centerLon,
                  queryCenterLat: centerLat,
                  queryWest: spatialFilter.bbox.west,
                  querySouth: spatialFilter.bbox.south,
                  queryEast: spatialFilter.bbox.east,
                  queryNorth: spatialFilter.bbox.north,
                  queryAreaDeg,
                  centerSigmaDeg: 10.0,
                  areaLogSigma: 1.5,
                  centerWeight: 1.0,
                  areaWeight: 1.0,
                  overlapWeight: 4.0,
                },
              },
            },
            weight: 1,
          },
        ],
      },
    };

    return scoringQuery as unknown as elasticsearch.QueryDslQueryContainer;
  }

  buildSearchRequest(searchRequestParameters: SearchRequestParameters, withAggregation = true) {
    const request: elasticsearch.SearchRequest = {
      from: searchRequestParameters.currentPage * searchRequestParameters.pageSize,
      size: searchRequestParameters.pageSize,
      track_total_hits: TRACK_TOTAL_HITS,
      query: this.buildQuery(
        searchRequestParameters.searchQuery,
        searchRequestParameters.filter,
        searchRequestParameters.filters ?? {},
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
    const request: elasticsearch.SearchRequest = {
      from: 0,
      size: 0,
      track_total_hits: TRACK_TOTAL_HITS,
      query: this.buildQuery(
        searchRequestParameters.searchQuery,
        searchRequestParameters.filter,
        searchRequestParameters.filters ?? {},
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
      if (trimmedField === '_score') {
        sort.push({ [trimmedField]: 'desc' });
      } else if (trimmedField.startsWith('-')) {
        sort.push({ [trimmedField.substring(1)]: 'desc' });
      } else {
        sort.push({ [trimmedField]: 'asc' });
      }
    }
    return sort;
  }

  buildSpatialEnvelopeFilter(
    field: string,
    bbox: SpatialBBox,
    relation: SpatialRelation,
  ): elasticsearch.QueryDslQueryContainer {
    return {
      geo_shape: {
        [field]: {
          shape: {
            type: 'envelope',
            coordinates: [
              [bbox.west, bbox.north],
              [bbox.east, bbox.south],
            ],
          },
          relation,
        },
      },
    } as unknown as elasticsearch.QueryDslQueryContainer;
  }

  isSpatialEnvelopeFilter(filter: elasticsearch.QueryDslQueryContainer, field: string): boolean {
    const geoShape = (
      filter as {
        geo_shape?: Record<string, { shape?: { type?: string; coordinates?: number[][] } }>;
      }
    ).geo_shape;

    const shape = geoShape?.[field]?.shape;
    return (
      shape?.type === 'envelope' &&
      Array.isArray(shape.coordinates) &&
      (shape.coordinates?.length || 0) >= 2
    );
  }

  removeSpatialEnvelopeFilters(
    filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    field: string,
  ): elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[] {
    const asArray = this.asFilterArray(filter);
    const filtered = asArray.filter((entry) => !this.isSpatialEnvelopeFilter(entry, field));
    return this.asFilterShape(filtered);
  }

  applySpatialEnvelopeFilter(
    filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    field: string,
    bbox: SpatialBBox,
    relation: SpatialRelation,
  ): elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[] {
    const asArray = this.asFilterArray(filter);
    const baseFilters = asArray.filter((entry) => !this.isSpatialEnvelopeFilter(entry, field));
    baseFilters.push(this.buildSpatialEnvelopeFilter(field, bbox, relation));
    return this.asFilterShape(baseFilters);
  }

  extractSpatialEnvelopeFilter(
    filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
    field: string,
  ): SpatialFilterData | null {
    const asArray = this.asFilterArray(filter);
    const spatialFilter = asArray.find((entry) => this.isSpatialEnvelopeFilter(entry, field));
    if (!spatialFilter) {
      return null;
    }

    const geoShape = (
      spatialFilter as {
        geo_shape?: Record<
          string,
          {
            shape?: { coordinates?: number[][] };
            relation?: SpatialRelation;
          }
        >;
      }
    ).geo_shape?.[field];

    const envelopeCoordinates = geoShape?.shape?.coordinates;
    if (!envelopeCoordinates || envelopeCoordinates.length < 2) {
      return null;
    }

    const [topLeft, bottomRight] = envelopeCoordinates;
    if (!topLeft || !bottomRight || topLeft.length < 2 || bottomRight.length < 2) {
      return null;
    }

    const relation =
      geoShape?.relation === 'within' ||
      geoShape?.relation === 'contains' ||
      geoShape?.relation === 'intersects'
        ? geoShape.relation
        : 'intersects';

    return {
      bbox: {
        west: topLeft[0],
        north: topLeft[1],
        east: bottomRight[0],
        south: bottomRight[1],
      },
      relation,
    };
  }

  private asFilterArray(
    filter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
  ): elasticsearch.QueryDslQueryContainer[] {
    return Array.isArray(filter) ? filter : [filter];
  }

  private asFilterShape(
    filters: elasticsearch.QueryDslQueryContainer[],
  ): elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[] {
    if (filters.length === 1) {
      return filters[0];
    }
    return filters;
  }
}
