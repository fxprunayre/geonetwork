import { Component, EventEmitter, input, Input, output, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { elasticsearch, IndexRecord } from 'gn-api-client';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faImage, faMap } from '@ng-icons/font-awesome/regular';
import {
  faSolidCircleInfo,
  faSolidDownload,
  faSolidShareNodes,
} from '@ng-icons/font-awesome/solid';
import { RecordFieldOverviewComponent } from '../../record/record-field-overview/record-field-overview.component';
import { RecordFieldType } from '../../record/record-field-type/record-field-type';
import { RecordFieldCredit } from '../../record/record-field-credit/record-field-credit';
import { RecordFieldTitle } from '../../record/record-field-title/record-field-title';

@Component({
  selector: 'app-result-item-list',
  templateUrl: './result-item-list.html',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    NgIcon,
    RecordFieldOverviewComponent,
    RecordFieldType,
    RecordFieldCredit,
    RecordFieldTitle,
  ],
  viewProviders: [
    provideIcons({ faImage, faMap, faSolidShareNodes, faSolidDownload, faSolidCircleInfo }),
  ],
})
export class ResultItemList {
  result = input.required<IndexRecord>();
  onRecordClick = output<string>();

  handleRecordClick() {
    const id = this.result().info?._id;
    if (!id) return;
    this.onRecordClick.emit(id);
  }
}
