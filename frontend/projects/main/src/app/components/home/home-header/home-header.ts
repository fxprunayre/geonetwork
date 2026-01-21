import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  SEARCH_ROUTE_PATH,
  SearchBase,
  SearchFilter,
  SearchInput,
  SearchRouteService,
  SearchWelcomeTextPipe,
} from 'gn-library';

@Component({
  selector: 'app-home-header',
  standalone: true,
  imports: [SearchInput, TranslatePipe, SearchWelcomeTextPipe],
  templateUrl: './home-header.html',
  styleUrl: './home-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeader extends SearchBase {
  router = inject(Router);
  searchRouteService = inject(SearchRouteService);

  setRouteToSearch() {
    this.router.navigate([SEARCH_ROUTE_PATH]);
  }

  setRouteForAggregation(filter: SearchFilter) {
    this.router.navigate([SEARCH_ROUTE_PATH], {
      queryParams: {
        [filter.field]: this.searchRouteService.buildFilterQueryParams(filter),
      },
    });
  }
}
