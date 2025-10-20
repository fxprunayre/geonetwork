import { Component, Input } from '@angular/core';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { AggregationTranslatePipe } from 'gn-library';

@Component({
  selector: 'app-aggregation-component',
  imports: [Checkbox, FormsModule, AggregationTranslatePipe],
  templateUrl: './aggregation-component.html',
  styleUrl: './aggregation-component.scss',
})
export class AggregationComponent {
  @Input() keyName!: string;
  @Input() bucket: any;
  @Input() getSelected!: (key: string, value: string) => boolean;
  @Input() setSelected!: (key: string, value: string, selected: boolean) => void;
}
