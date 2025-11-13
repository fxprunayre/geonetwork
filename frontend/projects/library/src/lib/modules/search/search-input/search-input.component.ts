import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  TemplateRef,
  viewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { AutoFocus } from 'primeng/autofocus';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { NgTemplateOutlet } from '@angular/common';
import { Popover } from 'primeng/popover';
import { TranslatePipe } from '@ngx-translate/core';
import { elasticsearch, IndexRecord } from 'gn-api-client';
import { SearchService } from '../../search/search.service';
import { SearchBase } from '../search-base/search-base';
import { PrimeTemplate } from 'primeng/api';
import { Button, ButtonIcon } from 'primeng/button';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FormsModule,
    NgIcon,
    TranslatePipe,
    AutoFocus,
    Popover,
    AutoComplete,
    PrimeTemplate,
    Button,
    ButtonIcon,
  ],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass, faSolidXmark })],
  templateUrl: './search-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput extends SearchBase {
  override searchService = inject(SearchService);

  autofocus = input<boolean>(true);
  searchOnInput = input<boolean>(false);
  placeholder = input<string | undefined>();

  popOverTemplate = input<TemplateRef<unknown>>();
  op = viewChild<Popover>('op');

  onSearch = output();
  queryString = '';
  items = signal<IndexRecord[]>([]);
  value: any;

  async onSearchWithText(event: AutoCompleteCompleteEvent) {
    console.log('onSearchWithText', event.query);
    const query = event.query.trim();
    if (!query) {
      this.items.set([]);
      return;
    }

    const request: elasticsearch.SearchRequest = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                type: 'bool_prefix' as any,
                fields: [
                  'resourceTitleObject.*^6',
                  'resourceAbstractObject.*^.5',
                  'tag',
                  'uuid',
                  'resourceIdentifier',
                ],
              },
            },
            {
              terms: {
                isTemplate: ['n'],
              },
            },
          ],
        },
      },
      size: 20,
      sort: ['_score'],
      _source: ['resourceTitleObject.*', 'resourceType'],
    };

    try {
      const response: any = await this.searchService.searchService.search(request).toPromise();
      console.log(response);
      this.items.set(
        response.hits.hits.map((hit: any) => {
          const title = hit._source.resourceTitleObject?.['default'];
          return {
            title,
            resourceType: hit._source.resourceType,
          };
        }) || [],
      );
    } catch (err) {
      console.error('Autocomplete error:', err);
      this.items.set([]);
    }
  }

  searchOnClick() {
    this.onModelChange(this.queryString);
  }

  searchOnInputChange($event: string) {
    this.queryString = $event;
    if (this.searchOnInput()) {
      this.onModelChange(this.queryString);
    }
  }

  onItemSelect(event: { value: { title: string } }) {
    this.queryString = event.value.title;
  }

  onModelChange(queryString: string) {
    console.log('Search input changed:', queryString, this.queryString);
    this.search.setFullTextQuery(queryString);
    this.onSearch.emit();
  }

  handleInputClick(event: MouseEvent) {
    if (this.op()) {
      this.op()?.toggle(event);
    }
  }

  clearQuery() {
    this.queryString = '';
    this.search.setFullTextQuery('');
  }
}
