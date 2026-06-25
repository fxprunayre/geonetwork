import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { SearchFilter } from './search-store.model';

export type FilterState = {
  filters: Record<string, SearchFilter>;
};

export const initialFilterState: FilterState = {
  filters: {},
};

export const FilterStore = signalStore(
  withState(initialFilterState),
  withComputed((store) => ({
    hasActiveFilters: computed(() => Object.keys(store.filters()).length > 0),
    activeFilterCount: computed(() => {
      let count = 0;
      for (const [, filter] of Object.entries(store.filters())) {
        count += filter.values.length;
      }
      return count;
    }),
  })),
  withMethods((store) => ({
    isFilterActive(field: string, value: string | number): boolean {
      const filter = store.filters()[field];
      if (!filter) {
        return false;
      }
      return filter.values.some((v) => v == value);
    },
    addFilter(
      field: string,
      value: string | number | (string | number)[],
      clear: boolean = false,
    ): void {
      const currentFilters = JSON.parse(JSON.stringify(store.filters())) || {};
      const targetFilter = currentFilters[field];
      const valuesToAdd = Array.isArray(value) ? value : [value];
      if (targetFilter) {
        if (clear) {
          targetFilter.values = [];
        }
        targetFilter.values.push(...valuesToAdd);
        targetFilter.values = [...new Set(targetFilter.values)];
      } else {
        currentFilters[field] = { field, values: valuesToAdd };
      }
      patchState(store, { filters: currentFilters });
    },
    clearFilter(field: string): void {
      const currentFilters = JSON.parse(JSON.stringify(store.filters())) || {};
      delete currentFilters[field];
      patchState(store, { filters: currentFilters });
    },
    removeFilter(field: string, value: string | number): void {
      const currentFilters = JSON.parse(JSON.stringify(store.filters())) || {};
      const targetFilter = currentFilters[field];
      if (targetFilter) {
        const clickedFilterIndex = targetFilter.values.findIndex(
          (v: string | number) => v == value,
        );
        if (clickedFilterIndex > -1) {
          targetFilter.values.splice(clickedFilterIndex, 1);
        }
        if (targetFilter.values.length === 0) {
          delete currentFilters[field];
        }
        patchState(store, { filters: currentFilters });
      }
    },
    reset(): void {
      patchState(store, { filters: {} });
    },
  })),
);

export type FilterStoreType = InstanceType<typeof FilterStore>;
