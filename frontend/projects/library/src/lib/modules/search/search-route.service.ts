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
    let urlParams = this.convertSearchToRouteParams(store);

    //this.location.go('/search', parameters);
    this.router.navigate(['/search'], { queryParams: urlParams });
    // this.historyService.addUrlToHistory(`/search?${parameters}`);
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

    return params;
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
