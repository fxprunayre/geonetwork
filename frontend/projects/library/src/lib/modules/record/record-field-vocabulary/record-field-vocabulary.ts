import { Component, computed, input, signal } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { Thesaurus } from 'gn-api-client';
import { Keyword, KeywordList } from '../../vocabularies/keyword-list/keyword-list';

interface KeywordWithId extends Keyword {
  _id: string;
}

@Component({
  selector: 'app-record-field-vocabulary',
  imports: [KeywordList],
  templateUrl: './record-field-vocabulary.html',
})
export class RecordFieldVocabulary extends RecordFieldBase {
  include = input<string[]>([]);
  exclude = input<string[]>([]);
  mainVocabularies = signal(['th_sextant-theme']);
  mode = input<'primary' | 'secondary'>('secondary');

  vocabularies = computed<Thesaurus[]>(() => {
    const rec = this.record();
    const allVocabularies: Record<string, Thesaurus> = rec['allKeywords'] || {};

    return Object.keys(allVocabularies)
      .filter(
        (key) =>
          (this.include().length === 0 || this.include().includes(key)) &&
          (this.exclude().length === 0 || !this.exclude().includes(key)),
      )
      .map((key) => allVocabularies[key]);
  });

  allKeywords = computed<KeywordWithId[]>(() => {
    const rec = this.record();
    if (!rec) return [];

    const groups = rec['allKeywords'] || {};
    const list: KeywordWithId[] = [];

    for (const vocab of Object.keys(groups)) {
      const vocabObj = groups[vocab];
      const arr = vocabObj.keywords || [];

      for (const item of arr as any[]) {
        const isVocabularyKeyword = !!item.link;
        const label = (item.default ?? '').trim();

        const mapped: KeywordWithId = {
          ...item,
          default: item.default,
          uri: item.link ?? null,
          vocabulary: isVocabularyKeyword ? vocab : null,
          _id: isVocabularyKeyword ? item.link : `free::${label.toLowerCase()}`,
        };

        list.push(mapped);
      }
    }

    return list;
  });

  primaryKeywords = computed(() => {
    return this.allKeywords().filter((k) => this.mainVocabularies().includes(k.vocabulary ?? ''));
  });

  secondaryKeywords = computed(() => {
    return this.allKeywords().filter((k) => !this.mainVocabularies().includes(k.vocabulary ?? ''));
  });

  displayKeywords = computed(() => {
    return this.mode() === 'primary' ? this.primaryKeywords() : this.secondaryKeywords();
  });
}
