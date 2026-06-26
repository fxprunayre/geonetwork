import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import {
  AggregationsStringTermsAggregate,
  AggregationsStringTermsBucket,
  elasticsearch,
} from 'gn-api-client';
import { SearchService } from './search-service';
import {
  DEFAULT_AGGREGATION_SIZE,
  SearchFilterParameters,
  SearchRequestParameters,
} from './search-store.model';

export interface AggregationState {
  aggregations: Record<string, elasticsearch.AggregationsAggregate>;
  aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[];
  aggregationsConfigTrigger: number;
}

export const initialAggregationState: AggregationState = {
  aggregations: {},
  aggregationsConfig: [],
  aggregationsConfigTrigger: 0,
};

export const AggregationStore = signalStore(
  withState(initialAggregationState),
  withMethods((store, searchService = inject(SearchService)) => ({
    hasAggregationBuckets(field: string): boolean {
      const aggregationValues = store.aggregations()[field];
      if (!aggregationValues) {
        return false;
      }
      const buckets = (aggregationValues as AggregationsStringTermsAggregate)
        .buckets as AggregationsStringTermsBucket[];
      return buckets !== undefined && buckets.length > 0;
    },
    hasMoreTerms(field: string): boolean {
      const aggregationValues = store.aggregations()[field];
      if (!aggregationValues) {
        return false;
      }
      return (aggregationValues as AggregationsStringTermsAggregate).sum_other_doc_count! > 0;
    },
    hasExpandedTerms(field: string): boolean {
      const aggregationsConfig = store.aggregationsConfig() as (
        | string
        | Record<string, elasticsearch.AggregationsAggregationContainer>
      )[];
      const aggObj = aggregationsConfig.find((agg) =>
        typeof agg === 'string' ? agg === field : Object.keys(agg)[0] === field,
      );
      if (!aggObj || typeof aggObj === 'string') {
        return false;
      }
      return !!aggObj[field]?.['meta']?.['expanded'];
    },
    loadMoreTerms(field: string, searchFilterParameters: SearchFilterParameters, size = 10) {
      const aggregationsConfig = JSON.parse(JSON.stringify(store.aggregationsConfig())) as (
        | string
        | Record<string, elasticsearch.AggregationsAggregationContainer>
      )[];
      const configIndex = aggregationsConfig.findIndex((agg) =>
        typeof agg === 'string' ? agg === field : Object.keys(agg)[0] === field,
      );
      if (configIndex === -1) return;

      let aggObj = aggregationsConfig[configIndex];
      if (typeof aggObj === 'string') {
        aggObj = { [field]: { terms: { field, size: DEFAULT_AGGREGATION_SIZE } } };
        aggregationsConfig[configIndex] = aggObj;
      }

      const aggField = aggObj[field];
      if (!aggField.terms) {
        return;
      }

      if (!aggField['meta']) aggField['meta'] = {};
      if (aggField['meta']['initialSize'] === undefined) {
        aggField['meta']['initialSize'] = aggField['terms']?.size || DEFAULT_AGGREGATION_SIZE;
      }

      aggField['terms']!.size = (aggField['terms']!.size || DEFAULT_AGGREGATION_SIZE) + size;
      aggField['meta']['expanded'] = true;

      searchService
        .updateAggregation(field, {
          ...searchFilterParameters,
          aggregationsConfig,
        } as SearchRequestParameters)
        .subscribe({
          next: (response) => {
            patchState(store, {
              aggregationsConfig,
              aggregations: {
                ...store.aggregations(),
                ...response.aggregations,
              },
            });
          },
          error: console.error,
        });
    },
    loadLessTerms(field: string, searchFilterParameters: SearchFilterParameters, size = 10) {
      const aggregationsConfig = JSON.parse(JSON.stringify(store.aggregationsConfig())) as (
        | string
        | Record<string, elasticsearch.AggregationsAggregationContainer>
      )[];
      const configIndex = aggregationsConfig.findIndex((agg) =>
        typeof agg === 'string' ? agg === field : Object.keys(agg)[0] === field,
      );
      if (configIndex === -1) return;

      const aggObj = aggregationsConfig[configIndex];
      if (typeof aggObj === 'string' || !aggObj[field].terms) {
        return;
      }

      const aggField = aggObj[field];
      if (!aggField['terms']) return;
      const currentSize = aggField['terms']?.size || DEFAULT_AGGREGATION_SIZE;
      const initialSize = aggField['meta']?.['initialSize'] || DEFAULT_AGGREGATION_SIZE;

      let newSize = currentSize - size;
      if (newSize <= initialSize) {
        newSize = initialSize;
        if (aggField['meta']) {
          aggField['meta']['expanded'] = false;
        }
      }
      aggField['terms'].size = newSize;

      searchService
        .updateAggregation(field, {
          ...searchFilterParameters,
          aggregationsConfig,
        } as SearchRequestParameters)
        .subscribe({
          next: (response) => {
            patchState(store, {
              aggregationsConfig,
              aggregations: {
                ...store.aggregations(),
                ...response.aggregations,
              },
            });
          },
          error: console.error,
        });
    },
    setAggregations(aggregations: Record<string, elasticsearch.AggregationsAggregate>) {
      patchState(store, { aggregations });
    },
    setAggregationsConfig(
      aggregationsConfig: (
        | string
        | Record<string, elasticsearch.AggregationsAggregationContainer>
      )[],
      silent = false,
    ) {
      patchState(store, {
        aggregationsConfig,
        aggregationsConfigTrigger: silent
          ? store.aggregationsConfigTrigger()
          : store.aggregationsConfigTrigger() + 1,
      });
    },
  })),
);

export type AggregationStoreType = InstanceType<typeof AggregationStore>;
