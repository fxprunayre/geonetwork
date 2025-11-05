import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { elasticsearch } from 'gn-api-client';
import { SearchBase } from '../../search/search-base/search-base';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-results',
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: './sort-results.html',
  styleUrls: ['./sort-results.scss'],
})
export class SortResults extends SearchBase {
  sortOptions: SortOption[] = [
    { label: 'Last update', value: 'lastUpdate' },
    { label: 'Popularity', value: 'popularity' },
    { label: 'Title', value: 'title' },
  ];

  selectedSort: string = 'lastUpdate';

  onSortChange(value: string): void {
    this.selectedSort = value;

    let sort: elasticsearch.Sort;

    switch (value) {
      case 'popularity':
        sort = [{ popularity: 'desc' }];
        break;
      case 'title':
        sort = [{ 'resourceTitleObject.default.keyword': 'asc' }];
        break;
      case 'lastUpdate':
      default:
        sort = [{ changeDate: 'desc' }];
    }

    this.search.setSort(sort);
  }
}
