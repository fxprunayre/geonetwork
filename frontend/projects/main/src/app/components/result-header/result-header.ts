import { Component, Input, Output, EventEmitter, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { APPLICATION_CONFIGURATION, SearchStore } from 'gn-library';
import { elasticsearch } from 'gn-api-client';
import { AggregationComponent } from '../../../../../library/src/lib/modules/search/aggregation-component/aggregation-component';

@Component({
  selector: 'app-result-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, AggregationComponent],
  templateUrl: './result-header.html',
  styleUrl: './result-header.scss',
})
export class ResultHeader {
  @Input() totalCount: number = 0;
  @Input() currentCount: number = 0;
  @Input() layout: 'list' | 'grid' = 'list';
  @Output() layoutChange = new EventEmitter<'list' | 'grid'>();

  topTabFilter = inject(APPLICATION_CONFIGURATION).config?.apps.search?.topTabFilter;

  selectedTabFilter?: string;

  onTabSelected(key: string) {
    this.selectedTabFilter = key;
  }

  readonly searchStore = inject(SearchStore);

  get getFilterData() {
    const filterKey = this.selectedTabFilter ?? this.topTabFilter;
    if (!filterKey) return undefined;

    const agg = this.searchStore.aggregations()?.[filterKey];
    const rawBuckets = agg?.buckets;

    const buckets = Array.isArray(rawBuckets) ? rawBuckets : Object.values(rawBuckets ?? {});

    return {
      key: filterKey,
      buckets,
    };
  }

  layoutOptions: ('list' | 'grid')[] = ['list', 'grid'];

  onLayoutChange(layout: any) {
    // Cast to the correct type to handle PrimeNG's type inference issue
    this.layoutChange.emit(layout as 'list' | 'grid');
  }
}
