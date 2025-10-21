import { inject, Injectable } from '@angular/core';
import { DEFAULT_AGGREGATION_SIZE } from './search.store.model';
import { elasticsearch } from 'gn-api-client';
import { RegistriesService } from 'gn4-api-client';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AggregationService {
  registriesService: RegistriesService = inject(RegistriesService);
  translateService = inject(TranslateService);

  /**
   * Interprets aggregation configuration which can be either a string (field name)
   * or a full aggregation configuration object. A default terms aggregation is created
   * when a string is provided.
   */
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

  getAggregationConfig(
    key: string,
    aggregationConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[],
  ) {
    for (const config of aggregationConfig) {
      const parsedConfig = this.parseAggregationConfig(config);
      if (parsedConfig[key]) {
        return parsedConfig[key];
      }
    }
    return undefined;
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

  private alreadyLoadedTranslations = new Set<string>();

  loadTranslations(
    aggregations: Record<string, elasticsearch.AggregationsAggregate>,
    aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[],
  ) {
    const currentLang = this.translateService.getCurrentLang();
    for (const [key, aggregation] of Object.entries(aggregations)) {
      if (aggregation.meta && aggregation.meta['translateOnLoad']) {
        const thesaurus =
          aggregation.meta['thesaurus'] ||
          this.getAggregationConfig(key, aggregationsConfig)?.['terms']?.field?.replace(
            /th_(.*)_tree.*/,
            '$1',
          );
        if (!thesaurus) {
          continue;
        }

        const buckets = aggregation.buckets;
        if (!Array.isArray(buckets) || buckets.length === 0) {
          continue;
        }

        const bucketKeySet = new Set<string>();
        for (const bucket of buckets) {
          const rawKey = String(bucket.key ?? '');
          for (const part of rawKey.split('^')) {
            if (!this.alreadyLoadedTranslations.has(`${currentLang}-${part}`)) {
              bucketKeySet.add(part);
            }
          }
        }

        if (bucketKeySet.size === 0) {
          continue;
        }

        // TODO: OpenApi is not using inBody, so passing large number of ids may hit URL length limits.
        // TODO: Modify OpenApi spec to use POST with body for this endpoint.
        this.registriesService
          .getKeywordByIds(Array.from(bucketKeySet).join(','), thesaurus, [currentLang])
          .subscribe((keywords) => {
            const newTranslations: Record<string, string> = {};
            Object.entries(keywords).forEach(
              ([key, value]: [string, { label?: string; definition?: string }]) => {
                newTranslations[key] = value.label || key;
                if (value.definition) {
                  newTranslations[`${key}-definition`] = value.definition;
                }
                this.alreadyLoadedTranslations.add(`${currentLang}-${key}`);
              },
            );

            this.translateService.setTranslation(currentLang, newTranslations, true);
          });
      }
    }
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
