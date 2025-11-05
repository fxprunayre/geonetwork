import { Component } from '@angular/core';
import {
  SearchContextDirective,
  SearchResultsNumber,
  SearchInput,
  ResultViewComponent,
  SortResults,
} from 'gn-library';

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
