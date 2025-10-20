import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SearchBox, SearchContextDirective, SearchService, SearchStoreType } from 'gn-library';
import { JsonPipe } from '@angular/common';
import { SearchWelcomeText } from '../search-welcome-text/search-welcome-text';
import { ButtonDirective, ButtonLabel } from 'primeng/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchBox, SearchContextDirective, SearchWelcomeText, ButtonLabel, ButtonDirective],
  templateUrl: './home-component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  currentQuery = '';
  parentIsHomepage = true;
  searchService = inject(SearchService);
  bgFirst = '/images/bgFirst.jpg';
  bgSecond = '/images/bgSecond.png';
  island = '/images/island.jpg';
  ngOnInit() {}
}
