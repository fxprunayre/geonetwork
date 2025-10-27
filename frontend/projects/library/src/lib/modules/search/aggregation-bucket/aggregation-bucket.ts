import { Component, computed, inject, input, model, output } from '@angular/core';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';
import { AggregationLayout } from 'gn-api-client';

@Component({
  selector: 'app-aggregation-bucket',
  imports: [Checkbox, FormsModule, Button],
  templateUrl: './aggregation-bucket.html',
  providers: [AggregationTranslatePipe],
  standalone: true,
})
export class AggregationBucket extends SearchBase {
  keyName = input.required<string>();
  bucket = input.required<{ key: string | number; doc_count: number }>();
  displayType = input<AggregationLayout | undefined>();
  selectedValue = model();

  aggregationTranslate = inject(AggregationTranslatePipe);

  layout = computed(() => {
    return (
      this.displayType() || this.search.aggregations()[this.keyName()].meta?.layout || 'checkbox'
    );
  });

  label = computed(() => {
    return `${this.aggregationTranslate.transform(this.bucket().key, this.keyName())}  (${this.bucket().doc_count})`;
  });

  isActive = computed(() => {
    return this.search.isFilterActive(this.keyName(), this.bucket().key);
  });

  tabSelected = output<string>();

  handleChange(bucketValue: string | number, value: boolean) {
    if (value && !this.isActive()) {
      this.search.addFilter(this.keyName(), bucketValue);
    } else if (!value && this.isActive()) {
      this.search.removeFilter(this.keyName(), bucketValue);
    }
  }
}
