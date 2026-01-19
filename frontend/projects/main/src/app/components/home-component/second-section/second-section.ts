import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Aggregation,
  SEARCH_ROUTE_PATH,
  SearchFilter,
  SearchRouteService,
  SearchService,
} from 'gn-library';

@Component({
  selector: 'second-section',
  standalone: true,
  imports: [Aggregation, TranslatePipe],
  templateUrl: './second-section.html',
  styleUrl: './second-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondSection {
  router = inject(Router);
  searchRouteService = inject(SearchRouteService);
  searchService = inject(SearchService);
  island = 'images/island.jpg';

  aggregations = computed(() => {
    return Object.keys(this.searchService.getSearch('home').aggregations());
  });

  setRouteForAggregation(filter: SearchFilter) {
    this.router.navigate([SEARCH_ROUTE_PATH], {
      queryParams: {
        [filter.field]: this.searchRouteService.buildFilterQueryParams(filter),
      },
    });
  }
}
