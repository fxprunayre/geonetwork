import { Component, computed } from '@angular/core';
import { SearchBase } from '../search-base/search-base';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';

@Component({
  selector: 'app-active-filters',
  imports: [Button, ButtonIcon, NgIcon, ButtonLabel, TranslatePipe],
  viewProviders: [provideIcons({ faSolidXmark })],
  standalone: true,
  providers: [AggregationTranslatePipe],
  templateUrl: './search-active-filters.component.html',
})
export class SearchActiveFilters extends SearchBase {
  hasActiveFilters = computed(() => {
    return Object.keys(this.search.filters()).length > 0;
  });

  constructor(private aggregationTranslate: AggregationTranslatePipe) {
    super();
  }

  getBuckets(field: string) {
    let buckets = this.search.aggregations()[field]?.buckets || [];
    if (Array.isArray(buckets)) {
      return buckets;
    }
    return [];
  }

  getActiveFilterCount(): number {
    let count = 0;
    for (const [, filter] of Object.entries(this.search.filters())) {
      count += filter.values.length;
    }
    return count;
  }

  getBucketLabel(groupKey: string, bucketKey: string | number): string {
    const key = String(bucketKey);
    const buckets = this.getBuckets(groupKey);
    const bucket = buckets?.find((b) => String(b.key) === key);

    if (!bucket) return key;

    return String(this.aggregationTranslate.transform(String(bucket.key), groupKey));
  }

  protected readonly Object = Object;
  protected readonly String = String;
}
