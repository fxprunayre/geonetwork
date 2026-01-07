import { Component, computed, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Thesaurus } from 'gn-api-client';
import { KeywordList } from '../../vocabularies/keyword-list/keyword-list';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-field-vocabulary',
  imports: [KeywordList],
  templateUrl: './record-field-vocabulary.html',
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class RecordFieldVocabulary extends RecordFieldBase {
  include = input<string[]>([]);
  exclude = input<string[]>([]);

  translateService = inject(TranslateService);

  vocabularies = computed<Thesaurus[]>(() => {
    const rec = this.record();
    const allVocabularies: Record<string, Thesaurus> = rec['allKeywords'] || {};

    return Object.keys(allVocabularies)
      .filter(
        (key) =>
          (this.include().length === 0 || this.include().includes(key)) &&
          (this.exclude().length === 0 || !this.exclude().includes(key)),
      )
      .map((key) => {
        return {
          ...allVocabularies[key],
          field: key,
        };
      })
      .sort(this.sortControlledBeforeFreeText);
  });

  // Order vocabularies by those having an id (from a vocabulary) before others (which are free text)
  private sortControlledBeforeFreeText(a: any, b: any) {
    if (a.id && !b.id) {
      return -1;
    }
    if (!a.id && b.id) {
      return 1;
    }
    return 0;
  }
}
