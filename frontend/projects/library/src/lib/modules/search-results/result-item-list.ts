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
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import {
  RecordFieldCredit,
  RecordFieldOverviewComponent,
  RecordFieldResourceEdition,
  RecordFieldResourceLastUpdate,
  RecordFieldTitle,
  RecordFieldType,
} from '../record';
import { RecordDistributionBadges } from '../record-distributions/record-distribution-badges/record-distribution-badges';
import { RECORD_ROUTE_PATH } from '../search/search-constant';

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
    TranslatePipe,
    RecordFieldResourceLastUpdate,
    RecordFieldResourceEdition,
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
  layout = input<'default' | 'compact' | 'version'>('default');
  navigateOnClick = input<boolean>(true);
  recordClick = output<string>();

  externalUrl = computed(() => {
    const result = this.result();
    if (!result) return null;
    const isRemote = result.info?.['origin'] === 'remote';
    return isRemote ? result['url'] : null;
  });

  handleRecordClick() {
    const result = this.result();
    if (!result) return;
    const id = result.uuid || result.info?._id;
    if (!id) return;
    this.recordClick.emit(id);
  }
}
