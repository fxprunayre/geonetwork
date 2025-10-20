import { Directive, inject, input, model, OnInit } from '@angular/core';
import { SearchService } from './search.service';
import { elasticsearch, IndexRecord } from 'gn-api-client';
import { DEFAULT_PAGE_SIZE } from './search.store.model';
import { SearchStore } from './search.store';

@Directive({
  selector: '[appSearchContext]',
  standalone: true,
  providers: [SearchStore],
})
export class SearchContextDirective implements OnInit {
  scope = input<string>('', { alias: 'appSearchContext' });
  routing = input<boolean>(false);
  aggregations = input<any>({});
  size = input<number>(DEFAULT_PAGE_SIZE);
  response = model<elasticsearch.SearchResponse<IndexRecord> | null>();

  searchStore = inject(SearchStore);
  searchService = inject(SearchService);

  constructor() {}

  ngOnInit(): void {
    this.searchStore.init(this.scope(), this.aggregations(), this.size(), this.routing());
    this.searchService.register(this.scope(), this.searchStore);
  }
}
