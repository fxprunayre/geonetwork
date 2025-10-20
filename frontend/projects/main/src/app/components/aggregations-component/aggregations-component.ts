import { Component, Input } from '@angular/core';
import { AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { TranslatePipe } from '@ngx-translate/core';
import { AggregationComponent } from '../aggregation-component/aggregation-component';

@Component({
  selector: 'app-aggregations-component',
  imports: [AccordionContent, AccordionHeader, AccordionPanel, TranslatePipe, AggregationComponent],
  templateUrl: './aggregations-component.html',
  styleUrl: './aggregations-component.scss',
})
export class AggregationsComponent {
  @Input() keyName!: string;
  @Input() aggregation: any;
  @Input() getBuckets!: (agg: any) => any[];
  @Input() getSelected!: (key: string, value: string) => boolean;
  @Input() setSelected!: (key: string, value: string, selected: boolean) => void;
}
