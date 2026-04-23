import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'aggregationTranslate',
  standalone: true,
  pure: false,
})
export class AggregationTranslatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  private static readonly aggregationKeyToServerSideTranslationKey: ReadonlyMap<string, string> =
    new Map([
      ['isTemplate', 'recordType'],
      ['groupOwner', 'group'],
      ['groupPublishedId', 'group'],
      ['sourceCatalogue', 'source'],
    ]);

  transform(value: string | number, aggregation: string): string | number {
    if (typeof value === 'number') {
      value = value.toString();
    }

    // TODO: Temporary handling hierachy of keyword separated by caret (^) in aggregation values
    // E.g. "Europe^Germany^Berlin" -> "Berlin"
    if (aggregation.indexOf('_tree.') !== -1 && value.indexOf('^')) {
      value = value.split('^').at(-1) || value;
    }
    const key = `${AggregationTranslatePipe.aggregationKeyToServerSideTranslationKey.get(aggregation) ?? aggregation}-${value}`;
    const translation = this.translateService.instant(key);

    if (translation !== key) {
      return translation;
    }

    const localKey = `search.aggregations.${key}`;
    const localTranslation = this.translateService.instant(localKey);
    if (localTranslation !== localKey) {
      return localTranslation;
    }

    return typeof value === 'string' ? this.translateService.instant(value) || value : value;
  }
}
