import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  ContentChild,
  effect,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { elasticsearch } from 'gn-api-client';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
  AccordionTabCloseEvent,
  AccordionTabOpenEvent,
} from 'primeng/accordion';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { SearchBase } from '../../search/search-base/search-base';
import { AggregationService } from '../aggregation-service';
import { Aggregation } from '../aggregation/aggregation';

@Component({
  selector: 'app-aggregations-panel',
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    Aggregation,
    NgTemplateOutlet,
    OverlayBadgeModule,
    TranslatePipe,
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

  hasActiveFilter = (keyName: string) => {
    return this.aggregationService.hasActiveFilter(
      keyName,
      this.search.aggregations(),
      this.search.isFilterActive.bind(this.search),
    );
  };

  hasBuckets = (key: string) => {
    return this.aggregationService.hasBuckets(key, this.search.aggregations());
  };

  getAggregationMetaLabel(key: string): string | null {
    return this.aggregationService.getAggregationMetaLabel(key, this.search.aggregationsConfig());
  }

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
