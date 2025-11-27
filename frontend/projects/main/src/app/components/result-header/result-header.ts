import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  Aggregation,
  APPLICATION_CONFIGURATION,
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
  ],
  templateUrl: './result-header.html',
  styleUrl: './result-header.scss',
})
export class ResultHeader {
  // TODO
  @Input() layout: 'list' | 'grid' = 'list';
  @Output() layoutChange = new EventEmitter<'list' | 'grid'>();

  topTabFilter = inject(APPLICATION_CONFIGURATION).config?.apps.search?.topTabFilter;

  layoutOptions: ('list' | 'grid')[] = ['list', 'grid'];

  onLayoutChange(layout: any) {
    // Cast to the correct type to handle PrimeNG's type inference issue
    this.layoutChange.emit(layout as 'list' | 'grid');
  }
}
