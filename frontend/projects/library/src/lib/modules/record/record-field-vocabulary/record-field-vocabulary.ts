import { Component, computed, input, signal } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { Thesaurus } from 'gn-api-client';
import { Keyword, KeywordList } from '../../vocabularies/keyword-list/keyword-list';

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
  mainVocabularies = signal(['th_sextant-theme']);
  mode = input<'primary' | 'secondary'>('secondary');
  styleClass = input<string>('');
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

  allKeywords = computed<Keyword[]>(() => {
    const rec = this.record();
    if (!rec) return [];

    const groups = rec['allKeywords'] || {};
    const list: Keyword[] = [];

    for (const vocabKey of Object.keys(groups)) {
      const vocabObj = groups[vocabKey];
      const keywords = vocabObj.keywords || [];

      for (const item of keywords as any[]) {
        const rawLink = item.link ?? item.uri ?? null;
        const hasLink = typeof rawLink === 'string' && rawLink.length > 0;

        list.push({
          default: (item.default ?? '').trim(),
          uri: rawLink,
          vocabulary: hasLink ? vocabKey : null,
        });
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
