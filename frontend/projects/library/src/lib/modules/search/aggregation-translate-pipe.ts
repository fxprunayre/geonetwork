import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'aggregationTranslate',
  standalone: true,
  pure: false
})
export class AggregationTranslatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  private static readonly translationKeys: ReadonlyMap<string, string> = new Map([
    ['isTemplate', 'recordType'],
    ['groupOwner', 'group'],
    ['groupPublishedId', 'group'],
    ['sourceCatalogue', 'source'],
  ]);

  transform(value: string | number, aggregation: string): string | number {
    if (typeof value === 'number') return value;
    const key = `${AggregationTranslatePipe.translationKeys.get(aggregation) ?? aggregation}-${value}`;
    const translation = this.translateService.instant(key);
    return translation !== key
      ? translation
      : typeof value === 'string'
        ? this.translateService.instant(value) || value
        : value;
  }
}
