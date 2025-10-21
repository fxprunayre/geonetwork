import { inject, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SearchFilter, SearchRequestParameters } from './search.store.model';

@Injectable({
  providedIn: 'root'
})
export class SearchRouteService {
  router = inject(Router);
  location = inject(Location);

  setRoute(store: SearchRequestParameters, pageSize: number) {
    let urlParams = [];
    if (store.searchQuery) {
      urlParams.push(`q=${store.searchQuery}`);
    }
    if (store.filters) {
      urlParams = urlParams.concat(
        Object.entries(store.filters)
          .filter(([field, filter]) => filter.values.length > 0)
          .map(
            ([field, filter]) =>
              `${field}="${filter.values.join('" OR "')}"`
          )
      );
    }
    if (store.currentPage !== 0) {
      urlParams.push(`from=${store.currentPage}`);
    }
    if (store.pageSize !== pageSize) {
      urlParams.push(`size=${store.pageSize}`);
    }
    this.location.go('/search', urlParams.filter(v => v !== '').join('&'));
  }

  convertRouteParamsToSearch(params: Params, pageSize: number): any {
    const filter: Record<string, SearchFilter> = {};
    const nonFilterParams = ['from', 'size', 'q'];

    Object.entries(params).forEach(([key, value]) => {
      if (!nonFilterParams.includes(key)) {
        const values = value.slice(1, -1).split('" OR "');
        filter[key] = {
          field: key,
          values: values
        };
      }
    });

    return {
      from: parseInt(params['from']) || 0,
      size: parseInt(params['size']) || pageSize,
      searchQuery: params['q'] || '',
      filters: filter
    };
  }

  buildFilterQueryParams(filter: SearchFilter) {
    return { [filter.field]: `"${Object.keys(filter.values).join('" OR "')}"` };
  }
}
