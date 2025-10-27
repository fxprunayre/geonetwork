import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Select } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';
import { FormsModule } from '@angular/forms';
import { AggregationBucket } from '../aggregation-bucket/aggregation-bucket';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';

@Component({
  selector: 'app-aggregation-component',
  standalone: true,
  imports: [Select, ButtonModule, FormsModule, AggregationBucket, AggregationTranslatePipe],
  templateUrl: './aggregation-component.html',
  styleUrl: './aggregation-component.scss',
})
export class AggregationComponent extends SearchBase {
  @Input() keyName!: string;
  @Input() buckets: { key: string | number; doc_count: number }[] = [];
  @Input() displayType: 'checkbox' | 'dropdown' | 'buttons' = 'checkbox';

  @Output() tabSelected = new EventEmitter<string>();

  selectedValue: string | null = null;
  active: string | null = 'all';

  onDropdownChange(value: string) {
    if (value === null) {
      // this.search.removeFilter(this.keyName, null);
    } else {
      this.search.addFilter(this.keyName, value);
    }
  }
}
