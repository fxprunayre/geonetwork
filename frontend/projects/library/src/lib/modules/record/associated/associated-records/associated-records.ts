import { Component, input, output, TemplateRef } from '@angular/core';
import { RecordFieldBase } from '../../record-field-base/record-field-base';
import { TranslatePipe } from '@ngx-translate/core';
import { ResultItemGrid } from '../../../results/result-item-grid/result-item-grid';
import { NgTemplateOutlet } from '@angular/common';
import { DataView } from 'primeng/dataview';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { provideIcons } from '@ng-icons/core';
import { faSolidExpand } from '@ng-icons/font-awesome/solid';
import { IndexRecord, RelatedItemType } from 'gn-api-client';

@Component({
  selector: 'app-associated-records',
  imports: [
    TranslatePipe,
    ResultItemGrid,
    NgTemplateOutlet,
    DataView,
    Button,
    Drawer
  ],
  providers: [provideIcons({ faSolidExpand })],
  templateUrl: './associated-records.html',
})
export class AssociatedRecords {
  type = input<string>('');
  relations = input<IndexRecord[]>([]);
  styleClass = input<string>('');
  resultTemplate = input<TemplateRef<unknown>>();
  onRecordClick = output<string>();

  isFullScreen = false;

  pageSize = 3;

  handleRecordClick(uuid: string) {
    this.isFullScreen = false;
    this.onRecordClick.emit(uuid);
  }
}
