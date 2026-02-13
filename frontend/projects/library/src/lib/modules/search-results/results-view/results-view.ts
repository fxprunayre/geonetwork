import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, inject, input, output, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { SearchBase } from '../../search/search-base/search-base';
import { NoResultFound } from '../no-result-found/no-result-found';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { ResultItemList } from '../result-item-list/result-item-list';
import { ResultsPaginatorComponent } from '../results-paginator/results-paginator';

@Component({
  selector: 'app-results-view',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NoResultFound,
    ResultItemGrid,
    ResultItemList,
    ResultsPaginatorComponent,
  ],
  templateUrl: './results-view.html',
})
export class ResultsView extends SearchBase {
  layout = input.required<SearchAppLayout>();
  onRecordClick = output<string>();

  @ContentChild('searchProgressTemplate') searchProgressTemplate: TemplateRef<any> | undefined;

  private router = inject(Router);

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }
}
