import { Component, EventEmitter, input, Input, output, Output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IndexRecord } from 'gn-api-client';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faImage } from '@ng-icons/font-awesome/regular';
import { faSolidEye, faSolidArrowUpRightFromSquare } from '@ng-icons/font-awesome/solid';
import { RecordFieldOverviewComponent } from '../../record/record-field-overview/record-field-overview.component';
import { RecordFieldTitle } from '../../record/record-field-title/record-field-title';
import { RecordFieldType } from '../../record/record-field-type/record-field-type';

@Component({
  selector: 'app-result-item-grid',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    RecordFieldOverviewComponent,
    RecordFieldOverviewComponent,
    RecordFieldTitle,
    RecordFieldType,
    NgIcon,
  ],
  templateUrl: './result-item-grid.html',
  viewProviders: [provideIcons({ faImage, faSolidEye, faSolidArrowUpRightFromSquare })],
})
export class ResultItemGrid {
  result = input.required<IndexRecord>();
  onRecordClick = output<string>();

  handleRecordClick() {
    const id = this.result().info?._id;
    if (!id) return;
    this.onRecordClick.emit(id);
  }
}
