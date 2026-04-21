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
  ],
  templateUrl: './results-info.html',
})
export class ResultsInfo {
  layout = model<SearchAppLayout>('list');
  @Input() layoutOptions: SearchAppLayout[] = [];

  topTabFilter = inject(APPLICATION_CONFIGURATION)().config?.apps.search?.topTabFilter;
}
