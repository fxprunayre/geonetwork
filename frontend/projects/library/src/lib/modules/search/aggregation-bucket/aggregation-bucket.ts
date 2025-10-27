import { Component, Input, model, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';

@Component({
  selector: 'app-aggregation-bucket',
  imports: [TranslatePipe, AggregationTranslatePipe, Checkbox, FormsModule, Button],
  templateUrl: './aggregation-bucket.html',
})
export class AggregationBucket extends SearchBase {
  @Input() keyName!: string;
  @Input() bucket: any;
  @Input() displayType: 'checkbox' | 'dropdown' | 'buttons' = 'checkbox';
  selectedValue = model();

  active = false;
  tabSelected = output<string>();

  isChecked(bucketKey: string): boolean {
    return this.search.isFilterActive(this.keyName, bucketKey);
  }

  onCheckboxChange(bucketKey: string, selected: boolean) {
    this.setSelected(this.keyName, bucketKey, selected);
  }

  onButtonClick(bucketKey: string) {
    // if (this.selectedValue === bucketKey) return;
    // this.buckets.forEach((bucket) => {
    //   const isSelected = bucket.key === bucketKey;
    //   this.setSelected(this.keyName, bucket.key, isSelected);
    // });
    // this.selectedValue = bucketKey;
    // this.setActive(bucketKey);
    // this.tabSelected.emit(bucketKey);
  }

  setActive(name: string): void {
    // this.active = this.active === name ? null : name;
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
