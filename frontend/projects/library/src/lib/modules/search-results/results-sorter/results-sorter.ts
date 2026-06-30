import { Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowDownShortWide, faSolidArrowUpShortWide } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { SearchBase } from '../../search/search-base/search-base';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-results-sorter',
  imports: [FormsModule, NgIcon, Select, TranslatePipe],
  viewProviders: [provideIcons({ faSolidArrowDownShortWide, faSolidArrowUpShortWide })],
  templateUrl: './results-sorter.html',
  standalone: true,
})
export class ResultsSorterComponent extends SearchBase {
  sortOptions = computed<SortOption[]>(() =>
    this.search()
      .sort()
      .map((sort) => ({
        label: `search.sort.options.${sort}`,
        value: sort,
      })),
  );

  onSortChange(sort: string) {
    this.search().setSort(sort);
    this.search().setRouting();
  }
}
