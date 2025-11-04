import { Component, computed, input } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { Thesaurus } from 'gn-api-client';
import { Keyword, KeywordList } from '../../vocabularies/keyword-list/keyword-list';

@Component({
  selector: 'app-record-field-vocabulary',
  imports: [KeywordList, KeywordList],
  templateUrl: './record-field-vocabulary.html',
})
export class RecordFieldVocabulary extends RecordFieldBase {
  include = input<string[]>([]);
  exclude = input<string[]>([]);

  vocabularies = computed<Thesaurus[]>(() => {
    const allVocabularies: Record<string, Thesaurus> = this.record().allKeywords || {};
    const filteredVocabularies: Thesaurus[] = [];
    for (const key of Object.keys(allVocabularies)) {
      if (
        (this.include().length === 0 || this.include().includes(key)) &&
        (this.exclude().length === 0 || !this.exclude().includes(key))
      ) {
        filteredVocabularies.push(allVocabularies[key]);
      }
    }
    return filteredVocabularies;
  });

  getKeywords(vocabulary: Thesaurus) {
    return (vocabulary.keywords || []) as Keyword[];
  }
}
