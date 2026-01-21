import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  ContentChild,
  effect,
  inject,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
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
  imports: [ResultItemGrid, ResultItemList, NgTemplateOutlet, SearchResultsPaginator, EmptyState],
  templateUrl: './result-view-component.html',
})
export class ResultViewComponent extends SearchBase {
  layout = input.required<SearchAppLayout>();
  onRecordClick = output<string>();

  @ContentChild('searchProgressTemplate') searchProgressTemplate: TemplateRef<any> | undefined;

  private router = inject(Router);

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }
}
