import { Component, computed } from '@angular/core';
import { SearchBase } from '../search-base/search-base';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { JsonPipe } from '@angular/common';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-active-filters',
  imports: [Button, ButtonIcon, NgIcon, ButtonLabel, JsonPipe],
  viewProviders: [provideIcons({ faSolidXmark })],
  standalone: true,
  templateUrl: './search-active-filters.component.html',
})
export class SearchActiveFilters extends SearchBase {
  hasActiveFilters = computed(() => {
    return Object.keys(this.search.filters()).length > 0;
  });
}
