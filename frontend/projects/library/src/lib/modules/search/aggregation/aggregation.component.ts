import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { Select, SelectChangeEvent } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';
import { FormsModule } from '@angular/forms';
import { AggregationBucket } from '../aggregation-bucket/aggregation-bucket';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationLayout } from 'gn-api-client';
import { TranslateService } from '@ngx-translate/core';
import { SearchFilter, SearchFilterChange } from '../search.store.model';

@Component({
  selector: 'app-aggregation',
  standalone: true,
  imports: [Select, ButtonModule, FormsModule, AggregationBucket, AggregationTranslatePipe],
  templateUrl: './aggregation.component.html',
})
export class Aggregation extends SearchBase {
  keyName = input.required<string>();
  displayType = input<AggregationLayout | undefined>();

  @Output()
  onSelected = new EventEmitter<SearchFilterChange>();

  translateService = inject(TranslateService);

  buckets = computed(() => {
    let buckets = this.search.aggregations()[this.keyName()]?.buckets || [];
    if (Array.isArray(buckets)) {
      return buckets as { key: string | number; doc_count: number }[];
    }
    return [];
  });

  layout = computed(() => {
    return (
      this.displayType() || this.search.aggregations()[this.keyName()].meta?.layout || 'checkbox'
    );
  });

  placeholder = computed(() => {
    return `${this.translateService.instant(this.keyName())}`;
  });

  handleChange(event: SelectChangeEvent) {
    this.filter({
      field: this.keyName(),
      values: event.value === null ? [] : [event.value.key],
      add: true,
    });
  }

  filter(event: SearchFilterChange) {
    if (this.onSelected.observed) {
      this.onSelected.emit(event);
      return;
    }

    if (event.values.length === 0) {
      this.search.clearFilter(this.keyName());
    } else if (event.add) {
      this.search.addFilter(this.keyName(), event.values[0]);
    } else if (!event.add) {
      this.search.removeFilter(this.keyName(), event.values[0]);
    }
  }
}
