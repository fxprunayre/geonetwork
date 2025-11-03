import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Aggregation, SearchFilter, SearchRouteService } from 'gn-library';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'second-section',
  standalone: true,
  imports: [ButtonLabel, ButtonDirective, Aggregation, TranslatePipe],
  templateUrl: './second-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondSection {
  router = inject(Router);
  searchRouteService = inject(SearchRouteService);
  bgSecond = 'images/bgSecond.png';
  island = 'images/island.jpg';

  setRouteForAggregation(filter: SearchFilter) {
    this.router.navigate(['/search'], {
      queryParams: {
        [filter.field]: this.searchRouteService.buildFilterQueryParams(filter),
      },
    });
  }
}
