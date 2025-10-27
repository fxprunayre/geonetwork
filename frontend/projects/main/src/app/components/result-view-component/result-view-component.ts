import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ResultItemList } from '../result-item-list/result-item-list';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { ResultHeader } from '../result-header/result-header';
import { EmptyStateComponent } from '../empty-state/empty-state';
import { SearchResultsPaginator, SearchStore, SearchStoreType, LoadingMask } from 'gn-library';

@Component({
  selector: 'app-result-view',
  standalone: true,
  imports: [
    ResultItemGrid,
    ResultItemList,
    ResultHeader,
    LoadingMask,
    EmptyStateComponent,
    SearchResultsPaginator,
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

  viewDetails(id: string) {
    this.router.navigate(['/record/', id]);
  }
}
