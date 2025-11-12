import { Component, inject, input } from '@angular/core';
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
  resultsContainerRef = input<HTMLElement>();
  pageSizeOptions = inject(APPLICATION_CONFIGURATION).config?.apps.search?.hitsPerPageOptions;

  onPageChange(event: any) {
    const containerRef = this.resultsContainerRef();
    if (containerRef) {
      containerRef.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      });
    }
    this.search.setPage(event.page, event.rows);
  }
}
