import { Injectable, computed, inject, signal } from '@angular/core';
import { Gn4UrlService } from '../config/gn4-url.service';
import { SearchService } from '../search/search-service';
import { initialState } from '../search/search-store';

@Injectable({
  providedIn: 'root',
})
export class RecordAddActionService {
  private readonly searchService = inject(SearchService);
  private readonly gn4UrlService = inject(Gn4UrlService);

  readonly templateCount = signal(0);
  readonly hasTemplates = computed(() => this.templateCount() > 0);

  private hasLoaded = false;

  constructor() {
    this.refreshTemplateCount();
  }

  refreshTemplateCount() {
    if (this.hasLoaded) {
      return;
    }

    this.searchService
      .search({
        ...initialState,
        filters: { isTemplate: { field: 'isTemplate', values: ['y'] } },
        pageSize: 0,
      })
      .subscribe((results) => {
        this.templateCount.set(results.totalCount);
        this.hasLoaded = true;
      });
  }

  getCreateRecordUrl() {
    return this.gn4UrlService.getEditorUrl('create');
  }

  openCreateRecord(target: string = '_blank') {
    if (!this.hasTemplates()) {
      return;
    }

    window.open(this.getCreateRecordUrl(), target);
  }
}
