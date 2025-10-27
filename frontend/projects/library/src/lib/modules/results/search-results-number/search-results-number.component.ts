import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';
import { SearchBase } from '../../search/search-base/search-base';

@Component({
  selector: 'app-search-results-number',
  imports: [TranslatePipe, DecimalPipe],
  templateUrl: './search-results-number.component.html',
})
export class SearchResultsNumber extends SearchBase {
  getResultTranslationKey() {
    return this.search.totalCount() === 1 ? 'result' : 'results';
  }
}
