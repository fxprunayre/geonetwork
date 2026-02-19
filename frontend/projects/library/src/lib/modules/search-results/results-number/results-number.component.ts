import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchBase } from '../../search/search-base/search-base';

@Component({
  selector: 'app-results-number',
  imports: [DecimalPipe, TranslatePipe],
  template: ` @if (search.isLoading() === false && search.totalCount() > 0) {
    <span class="text-primary-400" data-testid="search-results-number"
      >{{ search.totalCount() | number }} {{ labelKey() | translate }}</span
    >
  }`,
})
export class ResultsNumberComponent extends SearchBase {
  labelKey = input('search.result');
}
