import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  model,
  Output,
  output,
} from '@angular/core';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { Checkbox } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { Button, ButtonIcon } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';
import { AggregationLayout, Decorator } from 'gn-api-client';
import { Card } from 'primeng/card';
import { SearchFilter, SearchFilterChange } from '../search.store.model';
import { DecimalPipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AggregationBucketDecorator } from '../aggregation-bucket-decorator/aggregation-bucket-decorator';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-aggregation-bucket',
  imports: [
    Checkbox,
    FormsModule,
    Button,
    Card,
    AggregationTranslatePipe,
    AggregationBucketDecorator,
    ButtonIcon,
    Tooltip,
  ],
  templateUrl: './aggregation-bucket.html',
  providers: [AggregationTranslatePipe, DecimalPipe],
  standalone: true,
})
export class AggregationBucket extends SearchBase {
  keyName = input.required<string>();
  bucket = input.required<{ key: string | number; doc_count: number }>();
  displayType = input<AggregationLayout | undefined>();
  selectedValue = model();

  @Output()
  onSelected = new EventEmitter<SearchFilterChange>();

  aggregationTranslate = inject(AggregationTranslatePipe);
  translateService = inject(TranslateService);
  decimalPipe = inject(DecimalPipe);

  layout = computed(() => {
    return (
      this.displayType() || this.search.aggregations()[this.keyName()].meta?.layout || 'checkbox'
    );
  });

  decorator = computed<Decorator | undefined>(() => {
    return this.search.aggregations()[this.keyName()].meta?.decorator;
  });

  label = computed(() => {
    return `${this.aggregationTranslate.transform(this.bucket().key, this.keyName())}  (${this.decimalPipe.transform(this.bucket().doc_count, undefined, this.translateService.getCurrentLang())})`;
  });

  isActive = computed(() => {
    return this.search.isFilterActive(this.keyName(), this.bucket().key);
  });

  tabSelected = output<string>();

  handleChange(bucketValue: string | number, value: boolean) {
    this.onSelected.emit({
      field: this.keyName(),
      values: [bucketValue],
      add: !this.isActive(),
    });
  }
}
