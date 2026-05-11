import { Component } from '@angular/core';
import {
  ResultsNumberComponent,
  ResultsSorterComponent,
  ResultsView,
  SearchContextDirective,
  SearchInput,
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
