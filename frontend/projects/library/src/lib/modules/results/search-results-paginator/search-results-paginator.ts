import { Component } from '@angular/core';
import { SearchBase } from '../../search/search-base/search-base';
import { Paginator } from 'primeng/paginator';

@Component({
  selector: 'app-search-results-paginator',
  imports: [Paginator],
  standalone: true,
  templateUrl: './search-results-paginator.html',
})
export class SearchResultsPaginator extends SearchBase {
  pageSizeOptions = [5, 10, 20, 50];

  onPageChange(event: any) {
    this.search.setPage(event.page, event.rows);
  }
}
