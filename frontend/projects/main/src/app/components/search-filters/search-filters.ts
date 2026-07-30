import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AggregationsPanel, SpatialFilterComponent } from 'gn-library';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.html',
  standalone: true,
  imports: [FormsModule, CommonModule, AggregationsPanel, SpatialFilterComponent],
})
export class SearchFilters {}
