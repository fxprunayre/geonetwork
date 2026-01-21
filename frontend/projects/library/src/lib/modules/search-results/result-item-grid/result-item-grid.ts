import { Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { faImage } from '@ng-icons/font-awesome/regular';
import { faSolidArrowUpRightFromSquare, faSolidEye } from '@ng-icons/font-awesome/solid';
import { IndexRecord } from 'gn-api-client';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { RecordDistributionBadges } from '../../record-distributions/record-distribution-badges/record-distribution-badges';
import { RecordFieldOverviewComponent } from '../../record/record-field-overview/record-field-overview.component';
import { RecordFieldTitle } from '../../record/record-field-title/record-field-title';
import { RecordFieldType } from '../../record/record-field-type/record-field-type';
import { RouterLink } from '@angular/router';
import { RECORD_ROUTE_PATH } from '../../search/search-constant';

@Component({
  selector: 'app-result-item-grid',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    RecordFieldOverviewComponent,
    RecordFieldTitle,
    RecordFieldType,
    NgIcon,
    RecordDistributionBadges,
    RouterLink,
    NgTemplateOutlet,
    SkeletonModule,
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
  onRecordClick = output<string>();

  externalUrl = computed(() => {
    const r = this.result();
    return r?.info?.['origin'] === 'remote' && r['url'] ? r['url'] : undefined;
  });

  handleRecordClick() {
    const result = this.result();
    if (!result) return;
    const id = result.info?._id;
    if (!id) return;
    this.onRecordClick.emit(id);
  }
}
