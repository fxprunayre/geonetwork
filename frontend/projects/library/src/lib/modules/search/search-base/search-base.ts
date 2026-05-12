import { Component, inject, input, OnInit } from '@angular/core';
import { SearchService } from '../search-service';
import { SearchStoreType } from '../search-store';

@Component({
  selector: 'app-search-base',
  imports: [],
  template: '',
  standalone: true,
})
export class SearchBase implements OnInit {
  scope = input<string>('main');

  searchService = inject(SearchService);

  search: SearchStoreType = {} as SearchStoreType;

  ngOnInit() {
    this.search = this.searchService.getSearch<SearchStoreType>(this.scope());
  }
}
