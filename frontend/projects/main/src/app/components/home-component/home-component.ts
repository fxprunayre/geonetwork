import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SearchInput, SearchContextDirective, SearchService } from 'gn-library';
import { SearchWelcomeText } from '../search-welcome-text/search-welcome-text';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchInput, SearchContextDirective, SearchWelcomeText, ButtonLabel, ButtonDirective],
  templateUrl: './home-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  router = inject(Router);

  currentQuery = '';
  parentIsHomepage = true;
  searchService = inject(SearchService);
  bgFirst = '/images/bgFirst.jpg';
  bgSecond = '/images/bgSecond.png';
  island = '/images/island.jpg';

  setRouteToSearch() {
    this.router.navigate(['/search']);
  }
}
