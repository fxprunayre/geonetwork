import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { SearchBase } from '../../search/search-base/search-base';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-results',
  standalone: true,
  imports: [FormsModule, Select, TranslatePipe],
  templateUrl: './sort-results.html',
})
export class SortResults extends SearchBase {
  private readonly translateService = inject(TranslateService);

  sortOptions = computed<SortOption[]>(() =>
    this.search.sort().map((sort) => ({
      label: this.translateService.instant(`search.sort.options.${sort}`),
      value: sort,
    })),
  );

  onSortChange(sort: string) {
    this.search.setSort(sort);
    this.search.setRouting();
  }
}
