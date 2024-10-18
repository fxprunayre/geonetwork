import { Component, computed, input } from '@angular/core';
import { AsyncPipe, JsonPipe, NgClass } from '@angular/common';
import { AggregationsAggregationContainer } from '@elastic/elasticsearch/lib/api/types';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { SearchAggItemComponent } from '../search-agg-item/search-agg-item.component';
import {
  SearchFilterOperator,
  SearchFilterValue,
  SearchFilterValueState,
} from '../search.state.model';
import { ChipModule } from 'primeng/chip';
import { SearchModule } from '../search.module';
import { SearchAggMultiselectComponent } from '../search-agg-multiselect/search-agg-multiselect.component';
import { SearchBaseComponent } from '../search-base/search-base.component';
import { SearchAggSelectButtonComponent } from '../search-agg-selectbutton/search-agg-select-button.component';

export enum SearchAggLayout {
  CHECKBOX = 'checkbox',
  TRISTATE = 'tristate',
  CHIP = 'chip',
  CARD = 'card',
  SELECT_BUTTON = 'selectbutton',
  MULTISELECT = 'multiselect',
}

type SearchAggLayoutValues = keyof typeof SearchAggLayout;

@Component({
  selector: 'g-search-agg',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    CheckboxModule,
    FormsModule,
    TriStateCheckboxModule,
    SearchAggItemComponent,
    NgClass,
    ChipModule,
    SearchModule,
    SearchModule,
    SearchAggMultiselectComponent,
    SearchAggSelectButtonComponent,
  ],
  templateUrl: './search-agg.component.html',
  styleUrl: './search-agg.component.css',
})
export class SearchAggComponent extends SearchBaseComponent {
  aggregation = input.required<string>();
  layout = input<SearchAggLayout>();
  isLabelDisplayed = input<boolean | undefined>();

  isLabelDisplayedValue = computed(() => {
    return this.isLabelDisplayed() || this.agg()?.meta?.label !== false;
  });

  cssClass = computed(() => {
    switch (this.currentLayout()) {
      case SearchAggLayout.CHIP:
        return 'card flex flex-wrap items-center';
      case SearchAggLayout.MULTISELECT:
        return '';
      default:
        return 'mb-6';
    }
  });

  searchField: string = '';

  isSupported = false;

  aggregationConfig: AggregationsAggregationContainer;

  isSupportedAndHasValue = computed(() => {
    // @ts-ignore
    return this.isSupported && this.agg() && this.agg()?.buckets.length > 0;
  });

  currentLayout = computed(() => {
    return (
      this.layout() ||
      this.aggregationConfig.meta?.layout ||
      SearchAggLayout.CHECKBOX
    );
  });

  agg = computed(() => {
    if (Object.keys(this.search.aggregation()).length > 0) {
      const aggregationResponse = this.search.aggregation()[this.aggregation()];
      if (aggregationResponse === undefined) {
        console.warn(
          `${this.aggregation()} not found in the search response aggregations.
          Add this field to the search aggregation configuration for the context ${this.search.id()}.`
        );
      }
      return aggregationResponse;
    }
    return undefined;
  });
  protected readonly SearchAggLayout = SearchAggLayout;

  override ngOnInit() {
    super.ngOnInit();
    this.aggregationConfig = this.search.getAggregationConfig(
      this.aggregation()
    );
    this.searchField = this.search.getAggregationSearchField(
      this.aggregation()
    );
    this.#checkIfAggregationTypeIsSupported();
  }

  #checkIfAggregationTypeIsSupported() {
    this.isSupported = this.aggregationConfig.terms !== undefined;
    if (!this.isSupported) {
      console.warn(
        `${this.aggregation()} aggregation not supported. Only terms aggregations are supported.`
      );
    }
  }

  filter(filterValue: SearchFilterValue) {
    const value = Object.keys(filterValue)[0];
    const state = filterValue[value];
    // TODO: NOT and tri-state checkbox?
    if (state == SearchFilterValueState.OFF || state === null)
      this.search.removeFilterValue(this.searchField, value);
    else
      this.search.addFilter({
        field: this.searchField,
        values: {
          [value]: state,
        },
        operator: SearchFilterOperator.OR,
      });
  }
}
