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
} from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-aggregation-bucket-decorator',
  imports: [NgIcon],
  templateUrl: './aggregation-bucket-decorator.html',
  standalone: true,
  viewProviders: [
    // TODO: We can not all icons from font-awesome at once, so we need to list them here
    provideIcons({
      faSolidDatabase,
      faSolidMap,
      faSolidTable,
      faSolidCopy,
      faSolidChartColumn,
      faSolidBook,
      faSolidCloud,
    }),
  ],
})
export class AggregationBucketDecorator {
  bucket = input.required<any>();
  isActive = input<boolean>(false);
  decorator = input.required<Decorator | undefined>();

  icon = computed(() => {
    if (this.decorator() && this.decorator()?.type === 'icon') {
      return this.decorator()?.map?.[this.bucket().key] || this.bucket().key;
    }
    return '';
  });

  image = computed(() => {
    if (this.decorator() && this.decorator()?.type === 'img') {
      return this.decorator()?.map?.[this.bucket().key] || '';
    }
    return '';
  });
}
