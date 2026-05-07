import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  input,
  OnDestroy,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AggregationLayout, Decorator } from 'gn-api-client';
import { ButtonModule } from 'primeng/button';
import { MultiSelect, MultiSelectChangeEvent } from 'primeng/multiselect';
import { Select, SelectChangeEvent } from 'primeng/select';
import { SearchBase } from '../../search/search-base/search-base';
import { SearchFilterChange } from '../../search/search-store.model';
import { AggregationBucket } from '../aggregation-bucket/aggregation-bucket';
import { AggregationChart } from '../aggregation-chart/aggregation-chart';
import { AggregationService } from '../aggregation-service';
import { AggregationTranslatePipe } from '../aggregation-translate-pipe';
import { AggregationTree } from '../aggregation-tree/aggregation-tree';
import { AggregationBucketType } from './aggregation.model';

const CHART_LAYOUTS = ['bar', 'pie', 'treemap', 'nightingale'] as const;

@Component({
  selector: 'app-aggregation',
  standalone: true,
  imports: [
    AggregationBucket,
    AggregationChart,
    AggregationTree,
    ButtonModule,
    FormsModule,
    MultiSelect,
    NgTemplateOutlet,
    Select,
    TranslatePipe,
  ],
  providers: [AggregationTranslatePipe, DecimalPipe],
  templateUrl: './aggregation.html',
})
export class Aggregation extends SearchBase implements OnDestroy {
  keyName = input.required<string>();
  displayType = input<AggregationLayout | undefined>();

  @Output()
  onSelected = new EventEmitter<SearchFilterChange>();

  DISPLAY_FILTER_THRESHOLD = 10;

  translateService = inject(TranslateService);
  aggregationService = inject(AggregationService);
  aggregationTranslatePipe = inject(AggregationTranslatePipe);
  decimalPipe = inject(DecimalPipe);
  elementRef = inject(ElementRef);
  multiSelect = viewChild(MultiSelect);
  translationChange = toSignal(this.translateService.onTranslationChange);
  langChange = toSignal(this.translateService.onLangChange);

  selectedDropdownOptions = signal<AggregationBucketType[]>([]);

  constructor() {
    super();
    effect(() => {
      this.selectedDropdownOptions.set(
        this.buckets().filter((bucket) => this.search.isFilterActive(this.keyName(), bucket.key)),
      );
      this.aggregationService.loadAggregationTranslation(
        this.keyName(),
        this.search.aggregations()[this.keyName()],
        this.search.aggregationsConfig(),
      );

      if (this.isChartLayout()) {
        // AggregationChart is self-driven via its own effect(); no call needed here.
      }
    });
  }

  ngOnDestroy(): void {}

  displayFilter = computed(() => {
    return this.buckets().length > this.DISPLAY_FILTER_THRESHOLD;
  });

  isInputFilter = computed(() => {
    return this.displayFilter() && ['checkbox', 'button', 'card'].includes(this.layout());
  });

  isChartLayout = computed(() => {
    return (CHART_LAYOUTS as readonly string[]).includes(this.layout());
  });

  activeKeysList = computed(() =>
    this.buckets()
      .filter((b) => this.search.isFilterActive(this.keyName(), b.key))
      .map((b) => String(b.key)),
  );

  buckets = computed(() => {
    this.translationChange();
    this.langChange();

    let buckets = this.aggregationService.getBuckets(this.search.aggregations()[this.keyName()]);
    const aggregationConfig = this.aggregationService.getAggregationConfig(
      this.keyName(),
      this.search.aggregationsConfig(),
    );
    const histogramInterval = aggregationConfig?.histogram?.interval;
    if (buckets) {
      return buckets.map((bucket) => {
        const displayLabel = this.getBucketDisplayLabel(bucket.key, histogramInterval);
        return {
          key: bucket.key,
          label: `${displayLabel} (${this.decimalPipe.transform(bucket.doc_count, undefined, this.translateService.getCurrentLang())})`,
          displayLabel,
          doc_count: bucket.doc_count,
        } as AggregationBucketType;
      });
    }
    return [];
  });

  private getBucketDisplayLabel(key: string | number, histogramInterval?: number): string {
    const numericKey = typeof key === 'number' ? key : Number(key);
    if (
      typeof histogramInterval === 'number' &&
      histogramInterval !== 1 &&
      Number.isFinite(numericKey)
    ) {
      const from = this.formatNumber(numericKey);
      const to = this.formatNumber(numericKey + histogramInterval);
      return `${from} - ${to}`;
    }

    return String(this.aggregationTranslatePipe.transform(key, this.keyName()));
  }

  private formatNumber(value: number): string {
    // Keep year values readable (e.g. 2000 instead of 2,000).
    if (this.isYearAggregation() && Number.isInteger(value)) {
      return String(value);
    }

    return (
      this.decimalPipe.transform(value, undefined, this.translateService.getCurrentLang()) ||
      String(value)
    );
  }

  private isYearAggregation(): boolean {
    return this.keyName().toLowerCase().includes('year');
  }

  layout = computed(() => {
    const configuredLayout = this.search.aggregations()[this.keyName()]?.meta
      ?.layout as AggregationLayout;
    return this.displayType() || configuredLayout || 'checkbox';
  });

  decorator = computed<Decorator | undefined>(() => {
    return this.search.aggregations()[this.keyName()]?.meta?.decorator;
  });

  refreshPolicy = computed<'none' | undefined>(() => {
    return this.search.aggregations()[this.keyName()]?.meta?.refreshPolicy;
  });

  placeholder = computed(() => {
    return `${this.translateService.instant('search.aggregations.' + this.keyName())}`;
  });

  handleChange(event: SelectChangeEvent) {
    this.filter({
      field: this.keyName(),
      values: event.value === null ? [] : [event.value.key],
      add: true,
    });
  }

  handleMultiSelectChange(event: MultiSelectChangeEvent) {
    const isSelected =
      event.itemValue &&
      event.value.find((item: any) => {
        return item.key === event.itemValue.key;
      }) !== undefined;

    const values = [];
    if (event.itemValue) {
      values.push(event.itemValue.key);
    } else if (event.value.length > 0) {
      event.value.forEach((item: any) => {
        values.push(item.key);
      });
    }

    this.filter({
      field: this.keyName(),
      values: values,
      add: isSelected,
    });
  }

  handleMultiSelectClear() {
    this.search.clearFilter(this.keyName());
  }

  filter(event: SearchFilterChange, clear: boolean = false) {
    if (this.onSelected.observed) {
      this.onSelected.emit(event);
      return;
    }

    if (event.values.length === 0) {
      this.search.clearFilter(this.keyName());
    } else if (event.add) {
      const clearFilters = this.layout() === 'tree';
      this.search.addFilter(this.keyName(), event.values, clearFilters);
    } else if (!event.add) {
      this.search.removeFilter(this.keyName(), event.values[0]);
    }
  }

  onChartBucketClick(key: string) {
    const isActive = this.search.isFilterActive(this.keyName(), key);
    this.filter({
      field: this.keyName(),
      values: [key],
      add: !isActive,
    });
  }

  onChartRangeSelect(keys: string[]) {
    this.search.clearFilter(this.keyName());
    if (keys.length > 0) {
      this.filter({
        field: this.keyName(),
        values: keys,
        add: true,
      });
    }
  }

  // FIXME: ShadowDOM:
  // Listen for clicks outside the component to close the overlay
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: PointerEvent) {
    const multiSelect = this.multiSelect();
    if (!multiSelect?.overlayVisible) {
      return;
    }

    const clickPath = event.composedPath();

    // Check if click is inside the component
    if (!clickPath.includes(this.elementRef.nativeElement)) {
      multiSelect.hide();
    }
  }
}
