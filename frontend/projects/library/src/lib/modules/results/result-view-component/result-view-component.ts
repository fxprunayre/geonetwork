import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ResultItemList } from '../result-item-list/result-item-list';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { SearchStore, SearchStoreType } from '../../search/search.store';
import { LoadingMask } from '../../../shared/widgets/loading-mask/loading-mask.component';
import { SearchResultsPaginator } from '../search-results-paginator/search-results-paginator';
import { EmptyStateComponent } from '../empty-state/empty-state';

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
export class ResultViewComponent {
  layout: 'list' | 'grid' = 'list';
  private router = inject(Router);
  readonly store: SearchStoreType = inject(SearchStore);

  get results() {
    return this.store.results();
  }

  // Add this method to handle layout changes
  onLayoutChange(newLayout: 'list' | 'grid') {
    this.layout = newLayout;
  }

  // TODO: Move to app
  viewDetails(id: string) {
    this.router.navigate(['/record/', id]);
  }
}
