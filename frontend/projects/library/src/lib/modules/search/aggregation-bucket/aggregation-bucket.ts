import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  model,
  Output,
  output,
} from '@angular/core';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';
import { AggregationLayout } from 'gn-api-client';
import { Card } from 'primeng/card';
import { SearchFilter, SearchFilterChange } from '../search.store.model';

@Component({
  selector: 'app-aggregation-bucket',
  imports: [Checkbox, FormsModule, Button, Card, AggregationTranslatePipe],
  templateUrl: './aggregation-bucket.html',
  providers: [AggregationTranslatePipe],
  standalone: true,
})
export class AggregationBucket extends SearchBase {
  keyName = input.required<string>();
  bucket = input.required<{ key: string | number; doc_count: number }>();
  displayType = input<AggregationLayout | undefined>();
  selectedValue = model();

  @Output()
  onSelected = new EventEmitter<SearchFilterChange>();

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
    this.onSelected.emit({
      field: this.keyName(),
      values: [bucketValue],
      add: !this.isActive(),
    });
  }
}
