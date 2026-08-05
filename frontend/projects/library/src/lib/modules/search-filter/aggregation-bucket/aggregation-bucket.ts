import { DecimalPipe } from '@angular/common';
import { Component, computed, EventEmitter, inject, input, Output, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronRight } from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import { AggregationLayout, Decorator } from 'gn-api-client';
import { Button, ButtonIcon } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Tooltip } from 'primeng/tooltip';
import { CARD_LINES_1, CARD_LINES_2 } from '../../config/theme-card-lines';
import { SearchBase } from '../../search/search-base/search-base';
import { SearchFilterChange } from '../../search/search-store.model';
import { AggregationBucketDecorator } from '../aggregation-bucket-decorator/aggregation-bucket-decorator';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';

@Component({
  selector: 'app-aggregation-bucket',
  imports: [
    AggregationBucketDecorator,
    Button,
    ButtonIcon,
    Card,
    Checkbox,
    FormsModule,
    NgIcon,
    Tooltip,
  ],
  templateUrl: './aggregation-bucket.html',
  providers: [AggregationTranslatePipe, DecimalPipe],
  viewProviders: [provideIcons({ faSolidChevronRight })],
  standalone: true,
})
export class AggregationBucket extends SearchBase {
  keyName = input.required<string>();
  bucket = input.required<{ key: string | number; doc_count: number }>();
  displayType = input<AggregationLayout | undefined>();
  index = input(0);

  @Output()
  selected = new EventEmitter<SearchFilterChange>();

  aggregationTranslate = inject(AggregationTranslatePipe);
  translateService = inject(TranslateService);
  decimalPipe = inject(DecimalPipe);

  translationChange = toSignal(this.translateService.onTranslationChange);
  langChange = toSignal(this.translateService.onLangChange);

  layout = computed(() => {
    return (
      this.displayType() || this.search().aggregations()[this.keyName()].meta?.layout || 'checkbox'
    );
  });

  decorator = computed<Decorator | undefined>(() => {
    return this.search().aggregations()[this.keyName()].meta?.decorator;
  });

  label = computed(() => {
    this.translationChange();
    this.langChange();
    return `${this.aggregationTranslate.transform(this.bucket().key, this.keyName())}  (${this.decimalPipe.transform(this.bucket().doc_count, undefined, this.translateService.getCurrentLang())})`;
  });

  tooltip = computed(() => {
    this.translationChange();
    this.langChange();
    const definitionKeyWhenKeywordIsUsed = `${this.bucket().key}-definition`;
    const definition = this.translateService.instant(definitionKeyWhenKeywordIsUsed);
    if (definition && definition !== definitionKeyWhenKeywordIsUsed) {
      return definition;
    }
    return this.label();
  });

  isActive = computed(() => {
    return this.search().isFilterActive(this.keyName(), this.bucket().key);
  });

  isIconDecorator = computed(() => {
    return this.decorator()?.type === 'icon';
  });

  backgroundImage = computed(() => {
    const decorator = this.decorator();
    const bucket = this.bucket();
    const key = bucket?.key;

    if (decorator && decorator.type === 'img') {
      return decorator.map?.[key] || '';
    }
    return '';
  });

  cardStyle = computed(() => {
    const image = this.backgroundImage();
    if (image) {
      return {
        backgroundImage: `url('${image}')`,
        backgroundSize: 'cover',
        backgroundColor: 'var(--p-primary-300)',
        backgroundBlendMode: 'multiply',
        color: 'white',
      };
    } else if (this.isIconDecorator()) {
      return {
        backgroundColor: 'var(--p-primary-500)',
        color: 'white',
      };
    }

    // Use cardLines or cardLines2 on odd/even values
    const isEven = this.index() % 2 === 0;
    const svg = isEven ? CARD_LINES_2 : CARD_LINES_1;
    const encodedSvg = btoa(svg.replace(/#4A9DFF/g, 'white'));

    return {
      backgroundImage: `url('data:image/svg+xml;base64,${encodedSvg}')`,
      backgroundSize: 'cover',
      backgroundColor: 'var(--p-primary-500)',
      color: 'white',
    };
  });

  tabSelected = output<string>();

  handleChange(bucketValue: string | number, addValue: boolean) {
    this.selected.emit({
      field: this.keyName(),
      values: [bucketValue],
      add: addValue,
    });
  }
}
