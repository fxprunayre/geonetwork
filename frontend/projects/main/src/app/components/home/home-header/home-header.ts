import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  SEARCH_ROUTE_PATH,
  SearchBase,
  SearchFilter,
  SearchInput,
  SearchRouteService,
  SearchWelcomeTextPipe,
} from 'gn-library';

@Component({
  selector: 'app-home-header',
  imports: [SearchInput, TranslatePipe, SearchWelcomeTextPipe],
  templateUrl: './home-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeHeader extends SearchBase {
  router = inject(Router);
  searchRouteService = inject(SearchRouteService);

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  backgroundImageUrl = computed(() => this.appConfiguration().config?.backgroundImageUrl || '');

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
