import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AggregationsPanel, SpatialFilterComponent } from 'gn-library';

@Component({
  selector: 'app-search-filters',
  template: `
    <!--<app-active-filters></app-active-filters>-->
    <app-spatial-filter></app-spatial-filter>
    <app-aggregations-panel></app-aggregations-panel>
  `,
  standalone: true,
  imports: [FormsModule, CommonModule, AggregationsPanel, SpatialFilterComponent],
})
export class SearchFilters {}
