import { NgTemplateOutlet } from '@angular/common';
import { Component, input, output, TemplateRef } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidExpand } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { Button } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { Drawer } from 'primeng/drawer';
import { ResultItemGrid } from '../../../results/result-item-grid/result-item-grid';

@Component({
  selector: 'app-associated-records',
  imports: [TranslatePipe, ResultItemGrid, NgTemplateOutlet, DataView, Button, Drawer],
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
