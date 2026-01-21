import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { SearchBase } from '../../search/search-base/search-base';
import { TranslatePipe } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowDownShortWide, faSolidArrowUpShortWide } from '@ng-icons/font-awesome/solid';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-results',
  standalone: true,
  viewProviders: [provideIcons({ faSolidArrowDownShortWide, faSolidArrowUpShortWide })],
  imports: [FormsModule, Select, TranslatePipe, NgIcon, PrimeTemplate],
  templateUrl: './sort-results.html',
})
export class SortResults extends SearchBase {
  sortOptions = computed<SortOption[]>(() =>
    this.search.sort().map((sort) => ({
      label: `search.sort.options.${sort}`,
      value: sort,
    })),
  );

  onSortChange(sort: string) {
    this.search.setSort(sort);
    this.search.setRouting();
  }
}
