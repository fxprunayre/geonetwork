import { Component, ContentChild, inject, output, signal, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ResultItemList } from '../result-item-list/result-item-list';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { LoadingMask } from '../../../shared/widgets/loading-mask/loading-mask.component';
import { SearchResultsPaginator } from '../search-results-paginator/search-results-paginator';
import { EmptyState } from '../empty-state/empty-state';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { SearchBase } from '../../search/search-base/search-base';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { Skeleton } from 'primeng/skeleton';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-result-view',
  standalone: true,
  imports: [
    ResultItemGrid,
    ResultItemList,
    LoadingMask,
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

  resultsLayoutOptions =
    inject(APPLICATION_CONFIGURATION).config?.apps.search?.resultsLayoutOptions;
  layout = signal<SearchAppLayout>(this.resultsLayoutOptions?.[0] || 'list');

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }
}
