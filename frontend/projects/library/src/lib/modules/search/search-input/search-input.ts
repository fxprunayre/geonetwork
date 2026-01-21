import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { PrimeTemplate } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { Button, ButtonIcon } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { SearchService } from '../search-service';
import { SearchBase } from '../search-base/search-base';

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
    Popover,
    AutoComplete,
    PrimeTemplate,
    Button,
    ButtonIcon,
    InputText,
  ],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass, faSolidXmark })],
  templateUrl: './search-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput extends SearchBase {
  override searchService = inject(SearchService);
  elementRef = inject(ElementRef);
  autocomplete = viewChild(AutoComplete);

  autofocus = input<boolean>(true);
  searchOnInput = input<boolean>(false);
  placeholder = input<string | undefined>();
  popOverTemplate = input<TemplateRef<unknown>>();
  op = viewChild<Popover>('op');
  autocompleteEnabled = input<boolean>(true);

  searchBoxDesign = {
    borderColor: 'var(--p-primary-color)',
    colorScheme: {
      light: {
        root: {
          color: 'var(--p-primary-color)',
        },
      },
    },
  };

  onSearch = output();
  queryString = '';
  items = signal<IndexRecord[]>([]);
  value: any;

  constructor() {
    super();
    effect(() => {
      this.queryString = this.search.searchQuery() || '';
    });
  }

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
    this.onModelChange(this.queryString);
  }

  onModelChange(queryString: string) {
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

  // FIXME: ShadowDOM:
  // Listen for clicks outside the component to close the autocomplete suggestions
  // because when app is using Shadow DOM, p-auto-complete's do not close on outside clicks
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: PointerEvent) {
    if (!this.autocompleteEnabled()) return;

    const clickPath = event.composedPath();

    // Check if click is inside the component
    if (!clickPath.includes(this.elementRef.nativeElement)) {
      this.autocomplete()?.hide();
    }
  }
}
