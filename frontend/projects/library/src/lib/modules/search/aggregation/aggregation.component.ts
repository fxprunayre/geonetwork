import {
  Component,
  computed,
  effect,
  EventEmitter,
  inject,
  input,
  Output,
  signal,
} from '@angular/core';
import { Select, SelectChangeEvent } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';
import { FormsModule } from '@angular/forms';
import { AggregationBucket } from '../aggregation-bucket/aggregation-bucket';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationLayout } from 'gn-api-client';
import { TranslateService } from '@ngx-translate/core';
import { SearchFilterChange } from '../search.store.model';
import {
  MultiSelect,
  MultiSelectChangeEvent,
  MultiSelectSelectAllChangeEvent,
} from 'primeng/multiselect';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';

export type AggregationBucketType = {
  key: string | number;
  label: string;
  doc_count: number;
};

@Component({
  selector: 'app-aggregation',
  standalone: true,
  imports: [Select, ButtonModule, FormsModule, AggregationBucket, MultiSelect, NgTemplateOutlet],
  providers: [AggregationTranslatePipe, DecimalPipe],
  templateUrl: './aggregation.component.html',
})
export class Aggregation extends SearchBase {
  keyName = input.required<string>();
  displayType = input<AggregationLayout | undefined>();

  @Output()
  onSelected = new EventEmitter<SearchFilterChange>();

  DISPLAY_FILTER_THRESHOLD = 10;

  translateService = inject(TranslateService);
  aggregationTranslatePipe = inject(AggregationTranslatePipe);
  decimalPipe = inject(DecimalPipe);

  selectedDropdownOptions = signal<AggregationBucketType[]>([]);

  constructor() {
    super();
    effect(() => {
      this.selectedDropdownOptions.set(
        this.buckets().filter((bucket) => this.search.isFilterActive(this.keyName(), bucket.key)),
      );
    });
  }

  displayFilter = computed(() => {
    return this.buckets().length > this.DISPLAY_FILTER_THRESHOLD;
  });

  isInputFilter = computed(() => {
    return this.displayFilter() && ['checkbox', 'button', 'card'].includes(this.layout());
  });

  buckets = computed(() => {
    let buckets = this.search.aggregations()[this.keyName()]?.buckets || [];
    if (Array.isArray(buckets)) {
      return buckets.map((bucket) => {
        return {
          key: bucket.key,
          label: `${this.aggregationTranslatePipe.transform(bucket.key, this.keyName())} (${this.decimalPipe.transform(bucket.doc_count, undefined, this.translateService.getCurrentLang())})`,
          doc_count: bucket.doc_count,
        } as AggregationBucketType;
      });
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

  handleMultiSelectChange(event: MultiSelectChangeEvent) {
    const isSelected =
      event.itemValue &&
      event.value.find((item: any) => {
        return item.key === event.itemValue.key;
      }) !== undefined;

    const values = [];
    if (event.itemValue) {
      values.push(event.itemValue.key);
    } else if (event.value.length > 0) {
      event.value.forEach((item: any) => {
        values.push(item.key);
      });
    }

    this.filter({
      field: this.keyName(),
      values: values,
      add: isSelected,
    });
  }

  handleMultiSelectClear() {
    this.search.clearFilter(this.keyName());
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
