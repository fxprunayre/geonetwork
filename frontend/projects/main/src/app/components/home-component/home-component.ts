import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Aggregation,
  SearchContextDirective,
  SearchFilter,
  SearchInput,
  SearchService,
  SearchRouteService,
  SearchWelcomeText,
} from 'gn-library';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SearchInput,
    SearchContextDirective,
    SearchWelcomeText,
    ButtonLabel,
    ButtonDirective,
    Aggregation,
  ],
  templateUrl: './home-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  router = inject(Router);
  searchRouteService = inject(SearchRouteService);

  currentQuery = '';
  parentIsHomepage = true;
  searchService = inject(SearchService);
  bgFirst = '/images/bgFirst.jpg';
  bgSecond = '/images/bgSecond.png';
  island = '/images/island.jpg';

  setRouteToSearch() {
    this.router.navigate(['/search']);
  }

  setRouteForAggregation(filter: SearchFilter) {
    this.router.navigate(['/search'], {
      queryParams: {
        [filter.field]: this.searchRouteService.buildFilterQueryParams(filter),
      },
    });
  }
}
