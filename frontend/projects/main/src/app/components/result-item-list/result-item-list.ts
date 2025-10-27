import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import {
  RecordFieldOverviewComponent,
  RecordFieldType,
  RecordFieldCredit,
  RecordFieldTitle,
} from 'gn-library';

@Component({
  selector: 'app-result-item-list',
  templateUrl: './result-item-list.html',
  styleUrl: './result-item-list.scss',
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
  @Input() result!: IndexRecord;
  @Input() isFirst: boolean = false;
  @Output() viewDetails = new EventEmitter<string>();

  getDescription(): string {
    return this.result.resourceAbstractObject?.['default'] ?? '';
  }

  onViewDetails() {
    this.viewDetails.emit(this.result.info?._id);
  }
}
