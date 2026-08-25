import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Aggregation,
  APPLICATION_CONFIGURATION,
  ResultLayoutSwitcher,
  ResultsNumberComponent,
  ResultsSorterComponent,
  SearchAppLayout,
  SearchBase,
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
export class ResultsInfo extends SearchBase {
  layout = model<SearchAppLayout>('list');
  @Input() layoutOptions: SearchAppLayout[] = [];

  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  topTabFilter = computed(() => this.appConfiguration().config?.apps.search?.topTabAggregation);
  filterPosition = computed(
    () => this.appConfiguration().config?.apps.search?.filterPosition || 'side',
  );
}
