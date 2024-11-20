import {
  Directive,
  EnvironmentInjector,
  inject,
  input,
  OnInit,
  Optional,
  runInInjectionContext,
} from '@angular/core';
import { Dropdown } from 'primeng/dropdown';
import { toObservable } from '@angular/core/rxjs-interop';
import {SearchService} from "./search.service";
import {SearchStoreType} from "./search.state";

@Directive({
  selector: '[gSearchResultsLoader]',
  standalone: true,
})
export class SearchResultsLoaderDirective implements OnInit {
  injector = inject(EnvironmentInjector);
  scope = input<string>('', { alias: 'gSearchResultsLoader' });
  searchService = inject(SearchService);
  search: SearchStoreType;

  constructor(@Optional() private dropdown: Dropdown) {}

  public ngOnInit(): void {
    this.search = this.searchService.getSearch(this.scope());
    if (this.dropdown) {
      console.log(this.search);

      runInInjectionContext(this.injector, () => {
        toObservable(this.search.response).subscribe(() => {
          console.log(this.search.response()!.hits.hits);
          if (this.search.response() != null) {
            const options = this.search.response()!.hits.hits.map(hit => {
              return {
                label: hit._source!.resourceTitleObject!.default,
                type: hit._source!.resourceType![0],
                id: hit._id,
              };
            });
            this.dropdown.options = options;
          }
        });
      });
    }
  }
}