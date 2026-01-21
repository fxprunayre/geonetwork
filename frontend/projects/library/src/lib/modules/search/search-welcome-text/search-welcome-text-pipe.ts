import { inject, Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { SearchStoreType } from '../search-store';

interface AggregationBucket {
  key: string;
  doc_count: number;
}

@Pipe({
  name: 'searchWelcomeTextPipe',
  standalone: true,
  pure: false,
})
export class SearchWelcomeTextPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(
    search: SearchStoreType | undefined,
    field: string | undefined,
    limit: number = 3,
  ): string {
    if (!search) {
      return '';
    }
    if (search.totalCount() < 2) {
      return this.translateService.instant('search.welcome.default');
    }
    let mainBuckets = '';
    const buckets = search.aggregations()[field || '']?.buckets as AggregationBucket[] | undefined;
    if (Array.isArray(buckets) && buckets.length > 0) {
      mainBuckets = buckets
        .slice(0, limit)
        .map((bucket) => this.translateService.instant(bucket.key))
        .join(', ');
    }
    return this.translateService.instant('search.welcome.text', {
      count: new DecimalPipe(this.translateService.currentLang || 'en-US').transform(
        search.totalCount(),
      ),
      mainBuckets: mainBuckets,
    });
  }
}
