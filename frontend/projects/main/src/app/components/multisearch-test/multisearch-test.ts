import { Component } from '@angular/core';
import {
  SearchContextDirective,
  ResultsNumberComponent,
  SearchInput,
  ResultsView,
  ResultsSorterComponent,
} from 'gn-library';

@Component({
  selector: 'app-multisearch-test',
  imports: [
    SearchContextDirective,
    ResultsNumberComponent,
    ResultsSorterComponent,
    ResultsView,
    SearchInput,
    ResultsNumberComponent,
  ],
  templateUrl: './multisearch-test.html',
})
export class MultisearchTest {}
