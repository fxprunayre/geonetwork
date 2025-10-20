import { Component, computed, inject, Input, OnInit } from '@angular/core';
import { SearchStore } from 'gn-library';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Accordion } from 'primeng/accordion';
import { elasticsearch } from 'gn-api-client';
import { AggregationsComponent } from '../aggregations-component/aggregations-component';

interface BucketUI {
  key: string;
  name: string;
  count: number;
}

interface AggregationBucket {
  key: string;
  doc_count: number;
}

interface AggregationsAggregate {
  buckets: AggregationBucket[];
}

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
  standalone: true,
  imports: [FormsModule, Accordion, CommonModule, AggregationsComponent],
})
export class SidePanel implements OnInit {
  readonly searchStore = inject(SearchStore);

  get aggregations(): Record<string, elasticsearch.AggregationsAggregate> {
    return this.searchStore.aggregations();
  }
  aggregationKeys = computed(() => {
    // TODO: Get ordered keys from configuration
    return Object.keys(this.aggregations) || [];
  });
  aggregationList = computed(() => {
    return Object.values(this.aggregations) || [];
  });

  getBuckets(agg: any) {
    return agg?.buckets || [];
  }

  selectedFilters: Record<string, Record<string, boolean>> = {};

  getSelected(groupKey: string, bucketKey: string): boolean {
    return !!this.selectedFilters?.[groupKey]?.[bucketKey];
  }

  setSelected(groupKey: string, bucketKey: string, value: boolean) {
    console.log('setSelected called with:', { groupKey, bucketKey, value });

    if (!this.selectedFilters[groupKey]) {
      this.selectedFilters[groupKey] = {};
    }
    this.selectedFilters[groupKey][bucketKey] = value;

    if (value) {
      this.searchStore.addFilter(groupKey, bucketKey);
    } else {
      this.searchStore.removeFilter(groupKey, bucketKey);
    }
  }

  ngOnInit(): void {}
}
