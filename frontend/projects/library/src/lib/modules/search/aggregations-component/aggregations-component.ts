import { Component, computed, inject, Input } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { TranslatePipe } from '@ngx-translate/core';
import { AggregationComponent } from '../aggregation-component/aggregation-component';
import { SearchBase } from '../search-base/search-base';
import { elasticsearch } from 'gn-api-client';
import { AggregationService } from '../aggregation.service';

@Component({
  selector: 'app-aggregations-component',
  imports: [
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    TranslatePipe,
    AggregationComponent,
    Accordion,
  ],
  templateUrl: './aggregations-component.html',
  styleUrl: './aggregations-component.scss',
})
export class AggregationsComponent extends SearchBase {
  aggregationService = inject(AggregationService);

  get aggregations(): Record<string, elasticsearch.AggregationsAggregate> {
    return this.search.aggregations();
  }

  activePanels = computed(() => {
    return this.aggregationService.getActive(this.search.aggregationsConfig());
  });

  aggregationKeys = computed(() => {
    // TODO: Get ordered keys from configuration
    return Object.keys(this.aggregations) || [];
  });
  aggregationList = computed(() => {
    return Object.values(this.aggregations) || [];
  });

  getBuckets(field: string) {
    let buckets = this.search.aggregations()[field].buckets;
    if (Array.isArray(buckets)) {
      return buckets;
    }
    return [];
  }
}
