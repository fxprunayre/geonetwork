import { Component } from '@angular/core';
import { AggregationsPanel, SearchActiveFilters } from 'gn-library';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.html',
  standalone: true,
  imports: [FormsModule, CommonModule, AggregationsPanel],
})
export class SearchFilters {}
