import { Component, computed, input } from '@angular/core';
import { Decorator } from 'gn-api-client';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCopy,
  faSolidBook,
  faSolidChartColumn,
  faSolidDatabase,
  faSolidMap,
  faSolidTable,
  faSolidCloud,
  faSolidCode,
  faSolidFileContract,
  faSolidFolderClosed,
} from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-aggregation-bucket-decorator',
  imports: [NgIcon],
  templateUrl: './aggregation-bucket-decorator.html',
  standalone: true,
  viewProviders: [
    provideIcons({
      faSolidDatabase,
      faSolidMap,
      faSolidTable,
      faSolidCopy,
      faSolidChartColumn,
      faSolidBook,
      faSolidCloud,
      faSolidCode,
      faSolidFileContract,
      faSolidFolderClosed,
    }),
  ],
})
export class AggregationBucketDecorator {
  bucket = input.required<any>();
  isActive = input<boolean>(false);
  decorator = input.required<Decorator | undefined>();

  private readonly customIconMap: Record<string, string> = {
    software: 'faSolidCode',
    initiative: 'faSolidFileContract',
    repository: 'faSolidFolderClosed',
    'map-static': 'faSolidMap',
  };

  icon = computed(() => {
    const decorator = this.decorator();
    const bucket = this.bucket();
    const key = bucket?.key;

    if (!decorator || decorator.type !== 'icon') {
      return '';
    }

    if (!key) return '';

    if (decorator.type === 'icon') {
      const mapped = decorator.map?.[key];
      if (mapped) {
        return mapped;
      }
    }

    const custom = this.customIconMap[key];
    if (custom) {
      return custom;
    }

    return key;
  });

  image = computed(() => {
    const decorator = this.decorator();
    const bucket = this.bucket();
    const key = bucket?.key;

    if (decorator && decorator.type === 'img') {
      return decorator.map?.[key] || '';
    }
    return '';
  });
}
