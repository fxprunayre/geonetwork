import { Component, computed, input } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-record-field-codelist',
  imports: [TranslatePipe],
  templateUrl: 'record-field-codelist.html',
})
export class RecordFieldCodelist extends RecordFieldBase {
  codelist = input<string | undefined>();

  values = computed<{ default: string; link: string }[]>(() => {
    const codelist = this.codelist();
    if (!codelist) {
      return [];
    }
    return this.record()?.[codelist] || [];
  });
}
