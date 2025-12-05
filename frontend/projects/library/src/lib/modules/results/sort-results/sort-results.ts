import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { SearchBase } from '../../search/search-base/search-base';
import { TranslatePipe } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-results',
  standalone: true,
  imports: [FormsModule, Select, TranslatePipe, PrimeTemplate],
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
