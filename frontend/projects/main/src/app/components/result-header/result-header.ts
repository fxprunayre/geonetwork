import { Component, EventEmitter, inject, Input, model, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  Aggregation,
  APPLICATION_CONFIGURATION,
  ResultLayoutSwitcher,
  SearchAppLayout,
  SearchResultsNumber,
  SortResults,
} from 'gn-library';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-result-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SortResults,
    Aggregation,
    SearchResultsNumber,
    Card,
    ResultLayoutSwitcher,
  ],
  templateUrl: './result-header.html',
  styleUrl: './result-header.scss',
})
export class ResultHeader {
  layout = model<SearchAppLayout>('list');
  @Input() layoutOptions: SearchAppLayout[] = [];

  topTabFilter = inject(APPLICATION_CONFIGURATION)().config?.apps.search?.topTabFilter;
}
