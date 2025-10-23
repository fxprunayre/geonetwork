import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Checkbox } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { SearchBase } from '../search-base/search-base';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-aggregation-component',
  standalone: true,
  imports: [Checkbox, Select, ButtonModule, AggregationTranslatePipe, FormsModule, TranslatePipe],
  templateUrl: './aggregation-component.html',
  styleUrl: './aggregation-component.scss',
})
export class AggregationComponent extends SearchBase {
  @Input() keyName!: string;
  @Input() bucket: any;
  @Input() buckets: { key: string; doc_count: number }[] = [];
  @Input() displayType: 'checkbox' | 'dropdown' | 'buttons' = 'checkbox';

  @Output() tabSelected = new EventEmitter<string>();

  selectedValue: string | null = null;
  active: string | null = 'all';

  get dropdownOptions() {
    return this.buckets.map((bucket) => ({
      label: `${bucket.key} (${bucket.doc_count})`,
      value: bucket.key,
    }));
  }

  isChecked(bucketKey: string): boolean {
    return this.search.isFilterActive(this.keyName, bucketKey);
  }

  onCheckboxChange(bucketKey: string, selected: boolean) {
    this.setSelected(this.keyName, bucketKey, selected);
  }

  onDropdownChange(value: string) {
    if (this.selectedValue === value) return; // avoid redundant call
    this.buckets.forEach((bucket) => {
      const isSelected = bucket.key === value;
      this.setSelected(this.keyName, bucket.key, isSelected);
    });
    this.selectedValue = value;
  }

  onButtonClick(bucketKey: string) {
    if (this.selectedValue === bucketKey) return;
    this.buckets.forEach((bucket) => {
      const isSelected = bucket.key === bucketKey;
      this.setSelected(this.keyName, bucket.key, isSelected);
    });
    this.selectedValue = bucketKey;
    this.setActive(bucketKey);
    this.tabSelected.emit(bucketKey);
  }

  setActive(name: string): void {
    this.active = this.active === name ? null : name;
  }

  setSelected(groupKey: string, bucketKey: string, value: boolean) {
    const alreadyActive = this.search.isFilterActive(groupKey, bucketKey);
    if (value && !alreadyActive) {
      this.search.addFilter(groupKey, bucketKey);
    } else if (!value && alreadyActive) {
      this.search.removeFilter(groupKey, bucketKey);
    }
  }
}
