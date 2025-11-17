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
  autocompleteEnabled = input<boolean>(true);
  inputClasses =
    'w-full flex-1 px-4 py-2 border border-gray-400 rounded-full bg-white text-black focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

  onSearch = output();
  queryString = '';
  items = signal<IndexRecord[]>([]);
  value: any;

  async onSearchWithText(event: AutoCompleteCompleteEvent) {
    if (!this.autocompleteEnabled()) return;

    const query = event.query.trim();
    if (!query) {
      this.items.set([]);
      return;
    }

    try {
      const results = await this.searchService.autocompleteSearch(query);
      this.items.set(results);
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

    if (!this.autocompleteEnabled()) {
      this.items.set([]);
    }

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
