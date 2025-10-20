import { Component, computed, inject, Input } from '@angular/core';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { SearchBase } from '../search-base/search-base';

@Component({
  selector: 'app-aggregation-component',
  imports: [Checkbox, FormsModule, AggregationTranslatePipe],
  templateUrl: './aggregation-component.html',
  styleUrl: './aggregation-component.scss',
})
export class AggregationComponent extends SearchBase {
  @Input() keyName!: string;
  @Input() bucket: any;

  checked = false;

  isActive = computed(() => {
    const status = this.search.isFilterActive(this.keyName, this.bucket.key);
    this.checked = status;
    return status;
  });

  setSelected(groupKey: string, bucketKey: string, value: boolean) {
    if (value) {
      this.search.addFilter(groupKey, bucketKey);
    } else {
      this.search.removeFilter(groupKey, bucketKey);
    }
  }

  getSelected() {
    return true;
  }
}
