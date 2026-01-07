import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Aggregation, SearchFilter, SearchRouteService, SEARCH_ROUTE_PATH } from 'gn-library';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

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
  island = 'images/island.jpg';

  setRouteForAggregation(filter: SearchFilter) {
    this.router.navigate([SEARCH_ROUTE_PATH], {
      queryParams: {
        [filter.field]: this.searchRouteService.buildFilterQueryParams(filter),
      },
    });
  }
}
