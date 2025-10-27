import { Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SelectChangeEvent } from 'primeng/select';
import { SearchBase } from '../search-base/search-base';
import { FormsModule } from '@angular/forms';
import { AggregationBucket } from '../aggregation-bucket/aggregation-bucket';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationLayout } from 'gn-api-client';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-aggregation',
  standalone: true,
  imports: [Select, ButtonModule, FormsModule, AggregationBucket, AggregationTranslatePipe],
  templateUrl: './aggregation.component.html',
})
export class Aggregation extends SearchBase {
  keyName = input.required<string>();
  displayType = input<AggregationLayout | undefined>();
  // TODO
  @Output() tabSelected = new EventEmitter<string>();

  translateService = inject(TranslateService);

  buckets = computed(() => {
    let buckets = this.search.aggregations()[this.keyName()].buckets;
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
    if (event.value === null) {
      this.search.clearFilter(this.keyName());
    } else {
      this.search.addFilter(this.keyName(), event.value.key);
    }
  }
}
