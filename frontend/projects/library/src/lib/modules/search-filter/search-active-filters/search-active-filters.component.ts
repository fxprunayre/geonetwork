import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { SearchBase } from '../../search/search-base/search-base';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';

@Component({
  selector: 'app-active-filters',
  imports: [Button, NgIcon, TranslatePipe],
  viewProviders: [provideIcons({ faSolidXmark })],
  standalone: true,
  providers: [AggregationTranslatePipe],
  templateUrl: './search-active-filters.component.html',
})
export class SearchActiveFilters extends SearchBase {
  private aggregationTranslate = inject(AggregationTranslatePipe);

  getBuckets(field: string) {
    let buckets = this.search.aggregations()[field]?.buckets || [];
    if (Array.isArray(buckets)) {
      return buckets;
    }
    return [];
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
