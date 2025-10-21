import { Injectable } from '@angular/core';
import { DEFAULT_AGGREGATION_SIZE } from './search.store.model';
import { elasticsearch } from 'gn-api-client';

@Injectable({
  providedIn: 'root',
})
export class AggregationService {
  parseAggregationConfig(
    config: string | Record<string, elasticsearch.AggregationsAggregationContainer>,
  ) {
    if (typeof config === 'string') {
      return {
        config: {
          terms: {
            field: config,
            size: DEFAULT_AGGREGATION_SIZE,
          },
        },
      };
    } else if (typeof config === 'object' && config !== null) {
      return config;
    } else {
      console.warn('Invalid aggregation configuration:', config);
    }
    return {};
  }

  buildAggregationQuery(
    aggregationConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[],
  ): Record<string, elasticsearch.AggregationsAggregationContainer> {
    const aggregations: Record<string, elasticsearch.AggregationsAggregationContainer> = {};

    for (const config of aggregationConfig) {
      Object.assign(aggregations, this.parseAggregationConfig(config));
    }
    return aggregations;
  }

  getActive(aggregationsConfig: (string | Record<string, any>)[]) {
    return aggregationsConfig
      .map(this.parseAggregationConfig)
      .filter((aggregation) => {
        return aggregation[Object.keys(aggregation)[0]]?.meta?.['collapsed'] !== true;
      })
      .map((aggregation) => {
        return Object.keys(aggregation)[0];
      });
  }
}
