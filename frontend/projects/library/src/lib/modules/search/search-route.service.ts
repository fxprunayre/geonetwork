import { inject, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SearchFilter, SearchRequestParameters } from './search.store.model';
import { HistoryService } from '../../shared/history.service';

@Injectable({
  providedIn: 'root',
})
export class SearchRouteService {
  router = inject(Router);
  location = inject(Location);
  historyService = inject(HistoryService);

  buildFilterQueryParams(filter: SearchFilter): string {
    return `"${filter.values.join('" OR "')}"`;
  }

  setRoute(store: SearchRequestParameters, pageSize: number) {
    let urlParams = [];

    if (store.searchQuery) {
      urlParams.push(`q=${store.searchQuery}`);
    }

    if (store.filters) {
      urlParams = urlParams.concat(
        Object.entries(store.filters)
          .filter(([field, filter]) => filter.values.length > 0)
          .map(([field, filter]) => `${field}=${this.buildFilterQueryParams(filter)}`),
      );
    }

    if (store.currentPage !== 0) {
      urlParams.push(`from=${store.currentPage}`);
    }

    if (store.pageSize !== pageSize) {
      urlParams.push(`size=${store.pageSize}`);
    }

    if (store.currentSort) {
      urlParams.push(`sort=${store.currentSort}`);
    }
    const parameters = urlParams.filter((v) => v !== '').join('&');
    this.location.go('/search', parameters);
    this.historyService.addUrlToHistory(`/search?${parameters}`);
  }

  convertRouteParamsToSearch(params: Params, pageSize: number, currentSort: string): any {
    const filter: Record<string, SearchFilter> = {};
    const nonFilterParams = ['from', 'size', 'q', 'sort'];

    Object.entries(params).forEach(([key, value]) => {
      if (!nonFilterParams.includes(key)) {
        const values = value.slice(1, -1).split('" OR "');
        filter[key] = {
          field: key,
          values,
        };
      }
    });

    return {
      currentPage: parseInt(params['from']) || 0,
      pageSize: parseInt(params['size']) || pageSize,
      searchQuery: params['q'] || '',
      filters: filter,
      currentSort: params['sort'] || currentSort,
    };
  }
}
