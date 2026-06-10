import { AsyncPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MarkdownPipe } from 'ngx-markdown';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { RecordFieldDoi } from '../record-field-doi/record-field-doi';
import { RecordFieldOverviewComponent } from '../record-field-overview/record-field-overview.component';
import { RecordFieldResourceLastUpdate } from '../record-field-resource-last-update/record-field-resource-last-update';
import { RecordFieldVocabulary } from '../record-field-vocabulary/record-field-vocabulary';
import { RecordHarvesterLogo } from '../record-harvester-logo/record-harvester-logo';
import { RecordVersions } from '../record-versions/record-versions';

@Component({
  selector: 'app-record-view-header',
  imports: [
    AsyncPipe,
    MarkdownPipe,
    RecordFieldDoi,
    RecordFieldOverviewComponent,
    RecordFieldResourceLastUpdate,
    RecordFieldVocabulary,
    RecordVersions,
    ShowMoreToggle,
    RecordHarvesterLogo,
  ],
  templateUrl: './record-view-header.html',
})
export class RecordViewHeader extends RecordFieldBase {
  vocabularies = input<string[]>([]);
  onRecordClick = output<string>();
}
