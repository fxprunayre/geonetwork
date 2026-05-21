import { CommonModule } from '@angular/common';
import { Component, inject, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Aggregation,
  APPLICATION_CONFIGURATION,
  ResultLayoutSwitcher,
  ResultsNumberComponent,
  ResultsSorterComponent,
  SearchAppLayout,
} from 'gn-library';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { SearchFilters } from '../search-filters/search-filters';

@Component({
  selector: 'app-results-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ResultsSorterComponent,
    Aggregation,
    ResultsNumberComponent,
    Card,
    ResultLayoutSwitcher,
    SearchFilters,
  ],
  templateUrl: './results-info.html',
})
export class ResultsInfo {
  layout = model<SearchAppLayout>('list');
  @Input() layoutOptions: SearchAppLayout[] = [];

  appConfig = inject(APPLICATION_CONFIGURATION)().config;
  topTabFilter = this.appConfig?.apps.search?.topTabAggregation;
  filterPosition = this.appConfig?.apps.search?.filterPosition || 'side';
}
