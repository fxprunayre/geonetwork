import {
  Component,
  computed,
  inject,
  effect,
  input,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  AccordionTabCloseEvent,
  AccordionTabOpenEvent,
} from 'primeng/accordion';
import { TranslatePipe } from '@ngx-translate/core';
import { Aggregation } from '../aggregation/aggregation.component';
import { SearchBase } from '../../search/search-base/search-base';
import { elasticsearch } from 'gn-api-client';
import { AggregationService } from '../aggregation.service';
import { NgTemplateOutlet } from '@angular/common';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

@Component({
  selector: 'app-aggregations-panel',
  imports: [
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    TranslatePipe,
    Aggregation,
    Accordion,
    NgTemplateOutlet,
    OverlayBadgeModule,
  ],
  templateUrl: './aggregations-panel.component.html',
})
export class AggregationsPanel extends SearchBase {
  @ContentChild('labelTemplate') labelTemplate: TemplateRef<any> | undefined;

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

  hasActiveFilter = (keyName: string) => {
    let buckets = this.search.aggregations()[keyName]?.buckets || [];
    if (Array.isArray(buckets)) {
      for (const bucket of buckets) {
        if (this.search.isFilterActive(keyName, bucket.key)) {
          return true;
        }
      }
    }
    return false;
  };

  setPanelExpanded(event: AccordionTabOpenEvent) {
    this.updatePanelState(event.index + '', false);
  }

  setPanelCollapsed(event: AccordionTabCloseEvent) {
    this.updatePanelState(event.index + '', true);
  }

  private updatePanelState(index: string, isCollapsed: boolean) {
    this.search.setAggregationsConfig(
      this.aggregationService.setActive(index, !isCollapsed, this.search.aggregationsConfig()),
      true,
    );
  }
}
