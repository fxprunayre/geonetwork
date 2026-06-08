import { Component, input, model, output } from '@angular/core';
import { SearchActiveFiltersButton, SearchInput } from 'gn-library';
import { FilterPanelLayout } from '../../shared/models/search-layout.model';

@Component({
  selector: 'app-search-panel-controls',
  standalone: true,
  imports: [SearchInput, SearchActiveFiltersButton],
  template: `
    <div class="flex-1 min-w-0 flex flex-row items-center gap-2">
      <app-search-input
        class="grow"
        [scope]="scope()"
        [autocompleteEnabled]="autocompleteEnabled()"
        [placeholder]="placeholder()"
        (onSearch)="searchTriggered.emit()"
      />

      @if (showFilterButton() && (filterPanelMode() == 'drawer' || filterPanelMode() == 'side')) {
        <app-search-active-filters-button [(visible)]="visible" [scope]="scope()" />
      }
    </div>
  `,
})
export class SearchPanelControls {
  scope = input<string>('main');
  placeholder = input<string | undefined>(undefined);
  autocompleteEnabled = input(true);
  showFilterButton = input(true);
  filterPanelMode = input<FilterPanelLayout>('drawer');

  visible = model(false);
  searchTriggered = output<void>();
}
