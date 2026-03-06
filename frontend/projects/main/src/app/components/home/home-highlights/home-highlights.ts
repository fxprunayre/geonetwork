import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Aggregation,
  APPLICATION_CONFIGURATION,
  SEARCH_ROUTE_PATH,
  SearchBase,
  SearchFilter,
  SearchRouteService,
} from 'gn-library';

@Component({
  selector: 'app-home-highlights',
  standalone: true,
  imports: [Aggregation, TranslatePipe],
  templateUrl: './home-highlights.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHighlights extends SearchBase {
  router = inject(Router);
  searchRouteService = inject(SearchRouteService);

  aggregations = computed(() => {
    return Object.keys(this.search.aggregations());
  });

  setRouteForAggregation(filter: SearchFilter) {
    this.router.navigate([SEARCH_ROUTE_PATH], {
      queryParams: {
        [filter.field]: this.searchRouteService.buildFilterQueryParams(filter),
      },
    });
  }
}
