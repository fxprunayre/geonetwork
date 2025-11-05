import { Component, computed, inject } from '@angular/core';
import { RecordFieldBase } from '../../record-field-base/record-field-base';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { ResultItemGrid } from '../../../results/result-item-grid/result-item-grid';
import { Router } from '@angular/router';

@Component({
  selector: 'app-associated-records-panel',
  imports: [TranslatePipe, ResultItemGrid],
  templateUrl: './associated-records-panel.html',
})
export class AssociatedRecordsPanel extends RecordFieldBase {
  router = inject(Router);

  relations = computed<Record<string, IndexRecord[]>>(() => {
    return this.record().related || {};
  });
  types = computed(() => {
    return Object.keys(this.relations());
  });
  // TODO: Move to app
  viewDetails(uuid: string) {
    this.router.navigate(['/record/', uuid]);
  }
}
