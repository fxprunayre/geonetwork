import { Component, inject } from '@angular/core';
import { SearchBase } from '../../search/search-base/search-base';
import { Paginator } from 'primeng/paginator';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';

@Component({
  selector: 'app-search-results-paginator',
  imports: [Paginator],
  standalone: true,
  templateUrl: './search-results-paginator.html',
})
export class SearchResultsPaginator extends SearchBase {
  pageSizeOptions = inject(APPLICATION_CONFIGURATION).config?.apps.search?.hitsPerPageOptions;

  onPageChange(event: any) {
    this.search.setPage(event.page, event.rows);
  }
}
