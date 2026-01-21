import { Component, EventEmitter, inject, Input, model, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  Aggregation,
  APPLICATION_CONFIGURATION,
  ResultLayoutSwitcher,
  SearchAppLayout,
  ResultsNumberComponent,
  ResultsSorterComponent,
} from 'gn-library';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-results',
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
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  layout = model<SearchAppLayout>('list');
  @Input() layoutOptions: SearchAppLayout[] = [];

  topTabFilter = inject(APPLICATION_CONFIGURATION)().config?.apps.search?.topTabFilter;
}
