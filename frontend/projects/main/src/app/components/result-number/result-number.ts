import { Component, Input } from '@angular/core';
import { SearchBase } from 'gn-library';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-result-number',
  imports: [TranslatePipe],
  templateUrl: './result-number.html',
  styleUrl: './result-number.scss',
})
export class ResultNumber extends SearchBase {
  getResultTranslationKey() {
    return this.search.totalCount() === 1 ? 'result' : 'results';
  }
}
