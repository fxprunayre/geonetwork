import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ResultItemList } from '../result-item-list/result-item-list';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { LoadingMask } from '../../../shared/widgets/loading-mask/loading-mask.component';
import { SearchResultsPaginator } from '../search-results-paginator/search-results-paginator';
import { EmptyStateComponent } from '../empty-state/empty-state';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { SearchBase } from '../../search/search-base/search-base';
import { SearchAppLayout } from '../../config/model/gnConfig';

@Component({
  selector: 'app-result-view',
  standalone: true,
  imports: [
    ResultItemGrid,
    ResultItemList,
    LoadingMask,
    SearchResultsPaginator,
    EmptyStateComponent,
  ],
  templateUrl: './result-view-component.html',
  styleUrls: ['./result-view-component.scss'],
})
export class ResultViewComponent extends SearchBase {
  private router = inject(Router);

  resultsLayoutOptions =
    inject(APPLICATION_CONFIGURATION).config?.apps.search?.resultsLayoutOptions;
  layout = signal<SearchAppLayout>(this.resultsLayoutOptions?.[0] || 'list');

  // TODO: Move to app
  viewDetails(id: string) {
    this.router.navigate(['/record/', id]);
  }
}
