import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  ContentChild,
  effect,
  inject,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { SearchBase } from '../../search/search-base/search-base';
import { EmptyState } from '../empty-state/empty-state';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { ResultItemList } from '../result-item-list/result-item-list';
import { SearchResultsPaginator } from '../search-results-paginator/search-results-paginator';

@Component({
  selector: 'app-result-view',
  standalone: true,
  imports: [
    ResultItemGrid,
    ResultItemList,
    NgTemplateOutlet,
    Skeleton,
    SearchResultsPaginator,
    EmptyState,
  ],
  templateUrl: './result-view-component.html',
})
export class ResultViewComponent extends SearchBase {
  onRecordClick = output<string>();

  @ContentChild('searchProgressTemplate') searchProgressTemplate: TemplateRef<any> | undefined;

  private router = inject(Router);
  appConfiguration = inject(APPLICATION_CONFIGURATION);

  resultsLayoutOptions = computed(() => {
    return this.appConfiguration().config?.apps.search?.resultsLayoutOptions;
  });

  layout = signal<SearchAppLayout>(this.resultsLayoutOptions()?.[0] || 'list');

  constructor() {
    super();
    effect(() => {
      this.layout.set(this.resultsLayoutOptions()?.[0] || 'list');
    });
  }

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }
}
