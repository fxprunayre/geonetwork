import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import {
  SearchService,
  SearchStoreType,
} from 'gn-library';
import {elasticsearch} from 'gn-api-client';

interface SortOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-sort-results',
  standalone: true,
  imports: [FormsModule, Select],
  templateUrl: './sort-results.html',
  styleUrl: './sort-results.scss',
})
export class SortResults implements OnInit {
  private searchService = inject(SearchService);
  private searchStore: SearchStoreType;

  sortOptions: SortOption[] = [];
  selectedSort = 'lastUpdate';

  constructor() {
    this.searchStore = this.searchService.getSearch('main');
  }

  ngOnInit() {
    const labelMap: Record<string, string> = {
      lastUpdate: 'Last update',
      popularity: 'Popularity',
      title: 'Title',
    };

    this.sortOptions = Object.keys(labelMap).map((key) => ({
      label: labelMap[key],
      value: key,
    }));
  }

  onSortChange(value: string) {
    this.selectedSort = value;

    let sort: elasticsearch.Sort;

    switch (value) {
      case 'popularity':
        sort = [
          { popularity: { order: 'desc' } as unknown as elasticsearch.SortOrder },
        ];
        break;
      case 'title':
        sort = [
          {
            'resourceTitleObject.default.keyword': {
              order: 'asc',
            } as unknown as elasticsearch.SortOrder,
          },
        ];
        break;
      case 'lastUpdate':
      default:
        sort = [
          { changeDate: { order: 'desc' } as unknown as elasticsearch.SortOrder },
        ];
    }

    this.searchStore.setSort(sort);
    this.searchStore.search(this.searchStore.searchFilterParameters());
  }
}
