import { Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Paginator } from 'primeng/paginator';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { SearchBase } from '../../search/search-base/search-base';

@Component({
  selector: 'app-results-paginator',
  imports: [Button, Paginator, TranslateModule],
  templateUrl: './results-paginator.html',
  standalone: true,
})
export class ResultsPaginatorComponent extends SearchBase {
  resultsContainerRef = input<HTMLElement>();
  layoutMode = input<'paginator' | 'loadMore'>('paginator');

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  pageSizeOptions = computed(() => this.appConfiguration().config?.apps.search?.hitsPerPageOptions);

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

  loadMore() {
    this.search.loadMore();
  }
}
