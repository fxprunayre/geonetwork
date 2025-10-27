import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { IndexRecord } from 'gn-api-client';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faImage } from '@ng-icons/font-awesome/regular';
import { faSolidEye } from '@ng-icons/font-awesome/solid';
import { RecordFieldOverviewComponent } from '../../record/record-field-overview/record-field-overview.component';

@Component({
  selector: 'app-result-item-grid',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    NgIcon,
    RecordFieldOverviewComponent,
    RecordFieldOverviewComponent,
  ],
  templateUrl: './result-item-grid.html',
  viewProviders: [provideIcons({ faImage, faSolidEye })],
})
export class ResultItemGrid {
  @Input() result!: IndexRecord;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() download = new EventEmitter<string>();

  getTruncatedDescription(): string {
    const description = this.result.resourceAbstractObject?.['default'];
    if (!description) return 'No description available';

    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }

  onViewDetails() {
    this.viewDetails.emit(this.result.info?._id);
  }
}
