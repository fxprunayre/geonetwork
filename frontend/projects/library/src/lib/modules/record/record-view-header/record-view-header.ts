import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { IndexRecord } from 'gn-api-client';
import { MarkdownPipe } from 'ngx-markdown';
import { PrimeTemplate } from 'primeng/api';
import { Card } from 'primeng/card';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { RecordDistributionBadges } from '../distributions/record-distribution-badges/record-distribution-badges';
import { RecordFieldDoi } from '../record-field-doi/record-field-doi';
import { RecordFieldOverviewComponent } from '../record-field-overview/record-field-overview.component';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { RecordFieldVocabulary } from '../record-field-vocabulary/record-field-vocabulary';
import { RecordMenuComponent } from '../record-menu/record-menu.component';
import { RecordFieldResourceLastUpdate } from '../record-field-resource-last-update/record-field-resource-last-update';

@Component({
  selector: 'app-record-view-header',
  imports: [
    AsyncPipe,
    Card,
    MarkdownPipe,
    RecordFieldOverviewComponent,
    RecordFieldResourceLastUpdate,
    RecordFieldType,
    ShowMoreToggle,
    RecordFieldVocabulary,
    RecordFieldDoi,
    RecordDistributionBadges,
    RecordMenuComponent,
  ],
  templateUrl: './record-view-header.html',
})
export class RecordViewHeader {
  record = input.required<IndexRecord>();
  vocabularies = input<string[]>([]);
}
