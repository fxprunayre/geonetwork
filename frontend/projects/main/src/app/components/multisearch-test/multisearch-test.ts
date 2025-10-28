import { Component } from '@angular/core';
import {
  SearchContextDirective,
  SearchResultsNumber,
  SearchInput,
  ResultViewComponent,
} from 'gn-library';
import { SortResults } from '../sort-results/sort-results';

@Component({
  selector: 'app-multisearch-test',
  imports: [
    SearchContextDirective,
    SearchResultsNumber,
    SortResults,
    ResultViewComponent,
    SearchInput,
    SearchResultsNumber,
  ],
  templateUrl: './multisearch-test.html',
})
export class MultisearchTest {}
