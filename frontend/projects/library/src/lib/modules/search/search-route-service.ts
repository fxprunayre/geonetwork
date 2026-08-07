import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { elasticsearch } from 'gn-api-client';
import { HistoryService } from '../../shared/history-service';
import {
  DASHBOARD_ROUTE_PATH,
  MAP_ROUTE_PATH,
  RECORD_ROUTE_PATH,
  SEARCH_ROUTE_PATH,
  SIGNIN_ROUTE_PATH,
} from './search-constant';
import { SearchService } from './search-service';
import { SpatialBBox, SpatialRelation } from './search-spatial.model';
import { SearchFilter, SearchRequestParameters } from './search-store.model';

@Injectable({
  providedIn: 'root',
})
export class SearchRouteService {
  router = inject(Router);
  location = inject(Location);
  historyService = inject(HistoryService);
  searchService = inject(SearchService);

  private readonly SPATIAL_FIELD = 'geom';
  private readonly SPATIAL_BBOX_PARAM = 'bbox';
  private readonly SPATIAL_RELATION_PARAM = 'bboxRel';
  private lastSearchRouteParams: Params = {};

  rememberSearchRouteParams(params: Params) {
    this.lastSearchRouteParams = this.filterSearchRouteParams(params);
  }

  getLastSearchRouteParams(): Params {
    return { ...this.lastSearchRouteParams };
  }

  private filterSearchRouteParams(params: Params): Params {
    return Object.fromEntries(
      Object.entries(params).filter(([key]) => !['add', 'wmsAdd'].includes(key)),
    );
  }

  buildFilterQueryParams(filter: SearchFilter): string {
    return `"${filter.values.join('" OR "')}"`;
  }

  setRoute(store: SearchRequestParameters, _pageSize: number) {
    const urlParams = this.convertSearchToRouteParams(store);
    this.rememberSearchRouteParams(urlParams);

    this.router.navigate([SEARCH_ROUTE_PATH], { queryParams: urlParams });
  }

  convertSearchToRouteParams(store: SearchRequestParameters): Params {
    const params: Params = {};

    if (store.searchQuery) {
      params['q'] = store.searchQuery;
    }

    if (store.filters) {
      Object.entries(store.filters).forEach(([field, filter]) => {
        if (filter.values.length > 0) {
          params[field] = this.buildFilterQueryParams(filter);
        }
      });
    }

    if (store.currentPage && store.currentPage !== 0) {
      params['from'] = store.currentPage.toString();
    }

    if (store.pageSize) {
      params['size'] = store.pageSize.toString();
    }

    if (store.currentSort) {
      params['sort'] = store.currentSort;
    }

    if (store.layout) {
      params['layout'] = store.layout;
    }

    const spatialFilter = this.searchService.extractSpatialEnvelopeFilter(
      store.filter,
      this.SPATIAL_FIELD,
    );
    if (spatialFilter) {
      params[this.SPATIAL_BBOX_PARAM] = this.serializeSpatialBbox(spatialFilter.bbox);
      params[this.SPATIAL_RELATION_PARAM] = spatialFilter.relation;
    }

    return params;
  }

  convertRouteParamsToSearch(
    params: Params,
    pageSize: number,
    currentSort: string,
    currentLayout: string,
    currentFilter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
  ): Record<string, unknown> {
    this.rememberSearchRouteParams(params);
    const filter: Record<string, SearchFilter> = {};
    const nonFilterParams = [
      'from',
      'size',
      'q',
      'sort',
      'layout',
      this.SPATIAL_BBOX_PARAM,
      this.SPATIAL_RELATION_PARAM,
    ];

    Object.entries(params).forEach(([key, value]) => {
      if (!nonFilterParams.includes(key)) {
        const values = value.slice(1, -1).split('" OR "');
        filter[key] = {
          field: key,
          values,
        };
      }
    });

    const nextFilter = this.buildSpatialFilterFromParams(params, currentFilter);

    return {
      currentPage: parseInt(params['from']) || 0,
      pageSize: parseInt(params['size']) || pageSize,
      searchQuery: params['q'] || '',
      filter: nextFilter,
      filters: filter,
      currentSort: params['sort'] || currentSort,
      layout: params['layout'] || currentLayout,
    };
  }

  private serializeSpatialBbox(bbox: SpatialBBox): string {
    return [bbox.west, bbox.south, bbox.east, bbox.north].join(',');
  }

  private parseSpatialBbox(raw: unknown): SpatialBBox | null {
    if (!raw) {
      return null;
    }

    const value = Array.isArray(raw) ? raw[0] : raw;
    const parts = String(value)
      .split(',')
      .map((entry) => Number(entry.trim()));
    if (parts.length !== 4 || parts.some((entry) => !Number.isFinite(entry))) {
      return null;
    }

    const [west, south, east, north] = parts;
    return { west, south, east, north };
  }

  private parseSpatialRelation(raw: unknown): SpatialRelation {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === 'within' || value === 'contains' || value === 'intersects') {
      return value;
    }
    return 'intersects';
  }

  private buildSpatialFilterFromParams(
    params: Params,
    currentFilter: elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[],
  ): elasticsearch.QueryDslQueryContainer | elasticsearch.QueryDslQueryContainer[] {
    const filterWithoutSpatial = this.searchService.removeSpatialEnvelopeFilters(
      currentFilter,
      this.SPATIAL_FIELD,
    );

    const bbox = this.parseSpatialBbox(params[this.SPATIAL_BBOX_PARAM]);
    if (!bbox) {
      return filterWithoutSpatial;
    }

    const relation = this.parseSpatialRelation(params[this.SPATIAL_RELATION_PARAM]);
    return this.searchService.applySpatialEnvelopeFilter(
      filterWithoutSpatial,
      this.SPATIAL_FIELD,
      bbox,
      relation,
    );
  }

  shouldUpdateStateFromRoute(url: string): boolean {
    const baseUrl = url.split('?')[0];
    return !(
      baseUrl === '/' ||
      baseUrl === '/test' ||
      baseUrl.startsWith(SIGNIN_ROUTE_PATH) ||
      baseUrl.startsWith(RECORD_ROUTE_PATH) ||
      baseUrl.startsWith(DASHBOARD_ROUTE_PATH) ||
      baseUrl.startsWith(MAP_ROUTE_PATH)
    );
  }
}
