import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { elasticsearch } from 'gn-api-client';
import { RegistriesService } from 'gn4-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_AGGREGATION_SIZE } from '../search/search-store.model';

@Injectable({
  providedIn: 'root',
})
export class AggregationService {
  registriesService: RegistriesService = inject(RegistriesService);
  translateService = inject(TranslateService);
  private readonly appConfiguration = inject(APPLICATION_CONFIGURATION, { optional: true });

  private alreadyLoadedTranslations = new Set<string>();
  private inFlightRequests = new Map<string, Promise<void>>();

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
        [config]: {
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

  getBuckets(aggregation: elasticsearch.AggregationsAggregate | undefined | null): any[] {
    if (!aggregation || !aggregation.buckets) return [];
    if (Array.isArray(aggregation.buckets)) {
      return aggregation.buckets;
    } else if (typeof aggregation.buckets === 'object') {
      return Object.keys(aggregation.buckets).map((key) => ({
        key,
        ...(aggregation.buckets as any)[key],
      }));
    }
    return [];
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

  getAggregationMetaLabel(
    key: string,
    aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[],
  ): string | null {
    const aggregationConfig = this.getAggregationConfig(key, aggregationsConfig) as any;
    const labels = aggregationConfig?.meta?.labels as Record<string, string> | undefined;
    if (!labels || Object.keys(labels).length === 0) {
      return null;
    }

    const currentLang = this.translateService.getCurrentLang();
    const configuredLanguages = this.appConfiguration?.().config?.apps?.i18n?.languages || {};
    const iso3Lang = Object.keys(configuredLanguages).find(
      (iso3) => configuredLanguages[iso3] === currentLang,
    );

    return labels[iso3Lang || ''] || labels[currentLang] || labels[Object.keys(labels)[0]] || null;
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

  loadTranslations(
    aggregations: Record<string, elasticsearch.AggregationsAggregate>,
    aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[],
  ) {
    for (const [key, aggregation] of Object.entries(aggregations)) {
      this.loadAggregationTranslation(key, aggregation, aggregationsConfig);
    }
  }

  loadAggregationTranslation(
    key: string,
    aggregation: elasticsearch.AggregationsAggregate,
    aggregationsConfig: (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[],
  ) {
    const currentLang = this.translateService.getCurrentLang();

    if (aggregation && aggregation.meta && aggregation.meta['translateOnLoad']) {
      const thesaurus =
        aggregation.meta['thesaurus'] ||
        this.getAggregationConfig(key, aggregationsConfig)?.['terms']?.field?.replace(
          /th_(.*)_tree.*/,
          '$1',
        );

      if (!thesaurus) {
        return;
      }
      const buckets = this.getBuckets(aggregation);
      if (buckets.length === 0) {
        return;
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
        return;
      }

      // TODO: OpenApi is not using inBody, so passing large number of ids may hit URL length limits.
      // TODO: Modify OpenApi spec to use POST with body for this endpoint.
      // Loop on batches of 50 ids
      const idsArray = Array.from(bucketKeySet);
      const BATCH_SIZE = 30;

      const requestKey = `${currentLang}-${thesaurus}-${idsArray.sort().join(',')}`;

      // Avoid duplicate in-flight requests for the same data
      if (this.inFlightRequests.has(requestKey)) {
        return;
      }

      for (let i = 0; i < idsArray.length; i += BATCH_SIZE) {
        const batch = idsArray.slice(i, i + BATCH_SIZE);
        const batchRequestKey = `${currentLang}-${thesaurus}-${batch.sort().join(',')}`;

        // Avoid duplicate in-flight requests for this batch
        if (this.inFlightRequests.has(batchRequestKey)) {
          continue;
        }

        // Create a promise to track in-flight state
        const batchPromise = new Promise<void>((resolve) => {
          // Call service per batch; type the response to avoid implicit any
          const subscription = this.registriesService
            .getKeywordByIds(Array.from(batch).join(','), thesaurus, [currentLang])
            .subscribe(
              (keywords) => {
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
                this.inFlightRequests.delete(batchRequestKey);
                resolve();
              },
              (error) => {
                console.error('Error loading translations for batch', batch, error);
                this.inFlightRequests.delete(batchRequestKey);
                resolve();
              },
            );
        });

        this.inFlightRequests.set(batchRequestKey, batchPromise);
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

  setActive(key: string, active: boolean, aggregationsConfig: (string | Record<string, any>)[]) {
    return aggregationsConfig.map((aggregation) => {
      if (typeof aggregation === 'string') {
        // TODO: handle string case if needed
        return aggregation;
      }
      const aggKey = Object.keys(aggregation)[0];

      if (aggKey === key) {
        return {
          ...aggregation,
          [aggKey]: {
            ...aggregation[aggKey],
            meta: {
              ...aggregation[aggKey].meta,
              collapsed: !active,
            },
          },
        };
      }
      return aggregation;
    });
  }

  hasActiveFilter(
    keyName: string,
    aggregations: Record<string, elasticsearch.AggregationsAggregate>,
    isFilterActive: (key: string, bucketKey: string) => boolean,
  ): boolean {
    const buckets = this.getBuckets(aggregations[keyName]);
    for (const bucket of buckets) {
      if (isFilterActive(keyName, bucket.key)) {
        return true;
      }
    }
    return false;
  }

  hasBuckets(
    key: string,
    aggregations: Record<string, elasticsearch.AggregationsAggregate>,
  ): boolean {
    const agg = aggregations[key];
    const buckets = this.getBuckets(agg);
    return buckets.length > 0;
  }
}
