import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MarkdownPipe } from 'ngx-markdown';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { RecordFieldCodelist } from '../record-field-codelist/record-field-codelist';
import { RecordFieldDoi } from '../record-field-doi/record-field-doi';
import { RecordFieldOverviewComponent } from '../record-field-overview/record-field-overview.component';
import { RecordFieldResourceLastUpdate } from '../record-field-resource-last-update/record-field-resource-last-update';
import { RecordFieldVocabulary } from '../record-field-vocabulary/record-field-vocabulary';

@Component({
  selector: 'app-record-view-header',
  imports: [
    AsyncPipe,
    MarkdownPipe,
    RecordFieldCodelist,
    RecordFieldDoi,
    RecordFieldOverviewComponent,
    RecordFieldResourceLastUpdate,
    RecordFieldVocabulary,
    ShowMoreToggle,
  ],
  templateUrl: './record-view-header.html',
})
export class RecordViewHeader extends RecordFieldBase {
  vocabularies = input<string[]>([]);
}
