import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faImage, faMap } from '@ng-icons/font-awesome/regular';
import {
  faSolidArrowUpRightFromSquare,
  faSolidCircleInfo,
  faSolidDownload,
  faSolidShareNodes,
} from '@ng-icons/font-awesome/solid';
import { IndexRecord } from 'gn-api-client';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { RecordDistributionBadges } from '../../record-distributions/record-distribution-badges/record-distribution-badges';
import { RecordFieldCredit } from '../../record/record-field-credit/record-field-credit';
import { RecordFieldOverviewComponent } from '../../record/record-field-overview/record-field-overview.component';
import { RecordFieldTitle } from '../../record/record-field-title/record-field-title';
import { RecordFieldType } from '../../record/record-field-type/record-field-type';
import { RECORD_ROUTE_PATH } from '../../search/search-constant';

@Component({
  selector: 'app-result-item-list',
  templateUrl: './result-item-list.html',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule,
    NgIcon,
    RecordDistributionBadges,
    RecordFieldCredit,
    RecordFieldOverviewComponent,
    RecordFieldTitle,
    RecordFieldType,
    RouterLink,
    SkeletonModule,
  ],
  viewProviders: [
    provideIcons({
      faImage,
      faMap,
      faSolidShareNodes,
      faSolidDownload,
      faSolidCircleInfo,
      faSolidArrowUpRightFromSquare,
    }),
  ],
})
export class ResultItemList {
  protected readonly RECORD_ROUTE_PATH = RECORD_ROUTE_PATH;
  result = input<IndexRecord>();
  onRecordClick = output<string>();

  externalUrl = computed(() => {
    const result = this.result();
    if (!result) return null;
    const isRemote = result.info?.['origin'] === 'remote';
    return isRemote ? result['url'] : null;
  });

  handleRecordClick() {
    const result = this.result();
    if (!result) return;
    const id = result.info?._id;
    if (!id) return;
    this.onRecordClick.emit(id);
  }
}
