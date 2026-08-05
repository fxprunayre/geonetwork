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
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AggregationLayout, Decorator } from 'gn-api-client';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { MultiSelect, MultiSelectChangeEvent } from 'primeng/multiselect';
import { Select, SelectChangeEvent } from 'primeng/select';
import { SearchBase } from '../search/search-base/search-base';
import { SearchFilterChange } from '../search/search-store.model';
import { AggregationBucket } from './aggregation-bucket';
import { AggregationChart } from './aggregation-chart';
import { AggregationService } from './aggregation-service';
import { AggregationTranslatePipe } from './aggregation-translate-pipe';
import { AggregationTree } from './aggregation-tree';
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
    InputText,
    NgTemplateOutlet,
    Select,
    TranslatePipe,
    IconField,
    InputIcon,
    NgIcon,
  ],
  providers: [AggregationTranslatePipe, DecimalPipe],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass })],
  templateUrl: './aggregation.html',
})
export class Aggregation extends SearchBase {
  keyName = input.required<string>();
  displayType = input<AggregationLayout | undefined>();

  currentFilter = signal<string>('');

  @Output()
  selected = new EventEmitter<SearchFilterChange>();

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
        this.buckets().filter((bucket) => this.search().isFilterActive(this.keyName(), bucket.key)),
      );
      this.aggregationService.loadAggregationTranslation(
        this.keyName(),
        this.search().aggregations()[this.keyName()],
        this.search().aggregationsConfig(),
      );

      if (this.isChartLayout()) {
        // AggregationChart is self-driven via its own effect(); no call needed here.
      }
    });
  }

  isFilteringEnabledForAgg = computed(() => {
    return this.aggregationService.isDisplayFilterEnabled(
      this.search().aggregations()[this.keyName()],
    );
  });

  displayFilter = computed(() => {
    return this.buckets().length > this.DISPLAY_FILTER_THRESHOLD;
  });

  isFilterEnabled = computed(() => {
    if (this.currentFilter().trim() !== '') {
      return true;
    }
    return (
      this.isFilteringEnabledForAgg() &&
      this.displayFilter() &&
      ['checkbox', 'button', 'card'].includes(this.layout())
    );
  });

  isChartLayout = computed(() => {
    return (CHART_LAYOUTS as readonly string[]).includes(this.layout());
  });

  shouldOrderByTranslation = computed(() => {
    return this.aggregationService.isOrderByTranslationEnabled(
      this.search().aggregations()[this.keyName()],
    );
  });

  activeKeysList = computed(() =>
    this.buckets()
      .filter((b) => this.search().isFilterActive(this.keyName(), b.key))
      .map((b) => String(b.key)),
  );

  buckets = computed(() => {
    this.translationChange();
    this.langChange();

    const buckets = this.aggregationService.getBuckets(
      this.search().aggregations()[this.keyName()],
    );
    const aggregationConfig = this.aggregationService.getAggregationConfig(
      this.keyName(),
      this.search().aggregationsConfig(),
    );
    const histogramInterval = aggregationConfig?.histogram?.interval;
    if (buckets) {
      const mappedBuckets = buckets.map((bucket) => {
        const displayLabel = this.getBucketDisplayLabel(
          bucket['key'] as string | number,
          histogramInterval,
        );
        return {
          key: bucket['key'],
          label: `${displayLabel} (${this.decimalPipe.transform(bucket.doc_count, undefined, this.translateService.getCurrentLang())})`,
          displayLabel,
          doc_count: bucket.doc_count,
        } as AggregationBucketType;
      });

      if (this.shouldOrderByTranslation()) {
        return this.aggregationService.sortBucketsByDisplayLabel(
          mappedBuckets,
          this.translateService.getCurrentLang(),
        );
      }

      return mappedBuckets;
    }
    return [];
  });

  filteredBuckets = computed(() => {
    const filter = this.currentFilter().trim().toLowerCase();
    if (!filter) {
      return this.buckets();
    }

    return this.buckets().filter((bucket) => {
      return (
        String(bucket.key).toLowerCase().includes(filter) ||
        bucket.label.toLowerCase().includes(filter) ||
        String(bucket.displayLabel ?? '')
          .toLowerCase()
          .includes(filter)
      );
    });
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
    const configuredLayout = this.search().aggregations()[this.keyName()]?.meta
      ?.layout as AggregationLayout;
    return this.displayType() || configuredLayout || 'checkbox';
  });

  decorator = computed<Decorator | undefined>(() => {
    return this.search().aggregations()[this.keyName()]?.meta?.decorator;
  });

  refreshPolicy = computed<'none' | undefined>(() => {
    return this.search().aggregations()[this.keyName()]?.meta?.refreshPolicy;
  });

  isHistogram = computed(() => {
    const aggregationConfig = this.aggregationService.getAggregationConfig(
      this.keyName(),
      this.search().aggregationsConfig(),
    );
    return typeof aggregationConfig?.histogram?.interval === 'number';
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
      event.value.find((item: { key: string }) => {
        return item.key === (event.itemValue as { key: string }).key;
      }) !== undefined;

    const values: string[] = [];
    if (event.itemValue) {
      values.push((event.itemValue as { key: string }).key);
    } else if (event.value.length > 0) {
      event.value.forEach((item: { key: string }) => {
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
    this.search().clearFilter(this.keyName());
  }

  filter(event: SearchFilterChange, _clear = false) {
    if (this.selected.observed) {
      this.selected.emit(event);
      return;
    }

    if (event.values.length === 0) {
      this.search().clearFilter(this.keyName());
    } else if (event.add) {
      const clearFilters = this.layout() === 'tree';
      this.search().addFilter(this.keyName(), event.values, clearFilters);
    } else if (!event.add) {
      this.search().removeFilter(this.keyName(), event.values[0]);
    }
  }

  onChartBucketClick(key: string) {
    const isActive = this.search().isFilterActive(this.keyName(), key);
    this.filter({
      field: this.keyName(),
      values: [key],
      add: !isActive,
    });
  }

  onChartRangeSelect(keys: string[]) {
    this.search().clearFilter(this.keyName());
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
