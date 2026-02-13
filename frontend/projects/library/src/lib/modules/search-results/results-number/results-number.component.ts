import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchBase } from '../../search/search-base/search-base';

@Component({
  selector: 'app-results-number',
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './results-number.component.html',
  standalone: true,
})
export class ResultsNumberComponent extends SearchBase {
  getResultTranslationKey() {
    return this.search.totalCount() === 1 ? 'search.result' : 'search.results';
  }
}
