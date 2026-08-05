import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faImage } from '@ng-icons/font-awesome/regular';
import { faSolidArrowUpRightFromSquare, faSolidEye } from '@ng-icons/font-awesome/solid';
import { IndexRecord } from 'gn-api-client';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { RecordFieldOverviewComponent, RecordFieldTitle, RecordFieldType } from '../record';
import { RecordDistributionBadges } from '../record-distributions/record-distribution-badges/record-distribution-badges';
import { RECORD_ROUTE_PATH } from '../search/search-constant';

@Component({
  selector: 'app-result-item-grid',
  standalone: true,
  imports: [
    ButtonModule,
    NgIcon,
    NgTemplateOutlet,
    RecordDistributionBadges,
    RecordFieldOverviewComponent,
    RecordFieldTitle,
    RecordFieldType,
    RouterLink,
    SkeletonModule,
    TooltipModule,
  ],
  templateUrl: './result-item-grid.html',
  viewProviders: [
    provideIcons({
      faImage,
      faSolidEye,
      faSolidArrowUpRightFromSquare,
    }),
  ],
})
export class ResultItemGrid {
  protected readonly RECORD_ROUTE_PATH = RECORD_ROUTE_PATH;
  result = input<IndexRecord>();
  navigateOnClick = input<boolean>(true);
  recordClick = output<string>();

  externalUrl = computed(() => {
    const r = this.result();
    return r?.info?.['origin'] === 'remote' && r['url'] ? r['url'] : undefined;
  });

  handleRecordClick() {
    const result = this.result();
    if (!result) return;
    const id = result.uuid || result.info?._id;
    if (!id) return;
    this.recordClick.emit(id);
  }
}
