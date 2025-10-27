import { Component, computed, inject, effect, Input, input } from '@angular/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { TranslatePipe } from '@ngx-translate/core';
import { Aggregation } from '.././aggregation/aggregation.component';
import { SearchBase } from '../search-base/search-base';
import { elasticsearch } from 'gn-api-client';
import { AggregationService } from '../aggregation.service';

@Component({
  selector: 'app-aggregations-panel',
  imports: [
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    TranslatePipe,
    Aggregation,
    Accordion,
  ],
  templateUrl: './aggregations-panel.component.html',
})
export class AggregationsPanel extends SearchBase {
  aggregationService = inject(AggregationService);
  panelType = input<'accordion' | 'none'>('accordion');
  position = input<'left' | 'top'>('left');

  get aggregations(): Record<string, elasticsearch.AggregationsAggregate> {
    return this.search.aggregations();
  }

  activePanels = computed(() => {
    return this.aggregationService.getActive(this.search.aggregationsConfig());
  });

  constructor() {
    super();
    effect(() => {
      this.aggregationService.loadTranslations(
        this.search.aggregations(),
        this.search.aggregationsConfig(),
      );
    });
  }

  aggregationKeys = computed(() => {
    // TODO: Get ordered keys from configuration
    return Object.keys(this.aggregations) || [];
  });

  hasBuckets = (key: string) => {
    const agg = this.aggregations[key];
    return agg && Array.isArray(agg.buckets) && agg.buckets.length > 0;
  };
}
