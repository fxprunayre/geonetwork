import { Component, inject, OnInit } from '@angular/core';

import { Paginator } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultItemList } from '../result-item-list/result-item-list';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { ResultHeader } from '../result-header/result-header';
import { LoadingComponent } from '../loading-component/loading-component';
import { EmptyStateComponent } from '../empty-state/empty-state';
import { SearchStore, SearchStoreType, SearchResultsPaginator } from 'gn-library';

@Component({
  selector: 'app-result-view',
  standalone: true,
  imports: [
    ResultItemGrid,
    ResultItemList,
    ResultHeader,
    LoadingComponent,
    EmptyStateComponent,
    SearchResultsPaginator,
  ],
  templateUrl: './result-view-component.html',
  styleUrls: ['./result-view-component.scss'],
})
export class ResultViewComponent implements OnInit {
  layout: 'list' | 'grid' = 'list';
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  currentPage = 0;
  pageSize = 10;
  readonly store: SearchStoreType = inject(SearchStore);

  get results() {
    return this.store.results();
  }

  // Add this method to handle layout changes
  onLayoutChange(newLayout: 'list' | 'grid') {
    this.layout = newLayout;
  }

  ngOnInit() {
    // TODO: Q: Do we want paging in route params?
    this.route.queryParamMap.subscribe((params) => {
      const page = params.get('page');
      const size = params.get('size');

      if (page) {
        this.currentPage = parseInt(page, 10);
      }
      if (size) {
        this.pageSize = parseInt(size, 10);
      }
    });
  }

  viewDetails(id: string) {
    const currentQuery = this.route.snapshot.queryParamMap.get('q');
    this.router.navigate(['/catalogue/record/', id], {
      state: { searchQuery: currentQuery },
    });
  }

  onDownload(id: string) {
    // Implement download logic here
    console.log('Download:', id);
  }
}
