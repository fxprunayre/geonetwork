import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidChartColumn,
  faSolidCloud,
  faSolidCloudArrowDown,
  faSolidCode,
  faSolidCopy,
  faSolidDatabase,
  faSolidFileContract,
  faSolidFolderClosed,
  faSolidMap,
  faSolidTable,
} from '@ng-icons/font-awesome/solid';
import { Decorator } from 'gn-api-client';
import { InspireThemeStylesComponent } from './inspire-theme-styles';

@Component({
  selector: 'app-aggregation-bucket-decorator',
  imports: [NgIcon, InspireThemeStylesComponent],
  templateUrl: './aggregation-bucket-decorator.html',
  standalone: true,
  viewProviders: [
    // TODO: Decorator icons can't be loaded dynamically with the current implementation of @ng-icons
    provideIcons({
      faSolidDatabase,
      faSolidMap,
      faSolidCloudArrowDown,
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
  bucket = input.required<{ key?: string | number }>();
  isActive = input<boolean>(false);
  decorator = input.required<Decorator | undefined>();

  private readonly customIconMap: Record<string, string> = {
    software: 'faSolidCode',
    initiative: 'faSolidFileContract',
    repository: 'faSolidFolderClosed',
    'map-static': 'faSolidMap',
  };

  isInspireTheme = computed(() => {
    const decorator = this.decorator();
    return decorator?.type === 'icon' && decorator.prefix === 'iti-';
  });

  inspireThemeClass = computed(() => {
    const decorator = this.decorator();
    if (decorator && this.isInspireTheme()) {
      const bucket = this.bucket();
      const key = bucket?.key;
      return (
        decorator.prefix! +
        (decorator.expression
          ? String(key ?? '').replace(new RegExp(decorator.expression), '$1')
          : String(key ?? ''))
      );
    }
    return '';
  });

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

    return String(key ?? '');
  });

  image = computed(() => {
    const decorator = this.decorator();
    const bucket = this.bucket();
    const key = bucket?.key;

    if (decorator && decorator.type === 'img') {
      return decorator.map?.[key ?? ''] || '';
    }
    return '';
  });
}
