import { Component, input } from '@angular/core';
import { IndexRecord } from 'gn-api-client';
import { AsyncPipe } from '@angular/common';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Card } from 'primeng/card';
import { MarkdownPipe } from 'ngx-markdown';
import { NgIcon } from '@ng-icons/core';
import { PrimeTemplate } from 'primeng/api';
import { RecordFieldOverviewComponent } from '../record-field-overview/record-field-overview.component';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { RecordFieldVocabulary } from '../record-field-vocabulary/record-field-vocabulary';

@Component({
  selector: 'app-record-view-header',
  imports: [
    AsyncPipe,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Card,
    MarkdownPipe,
    NgIcon,
    PrimeTemplate,
    RecordFieldOverviewComponent,
    RecordFieldType,
    ShowMoreToggle,
    RecordFieldVocabulary,
  ],
  templateUrl: './record-view-header.html',
})
export class RecordViewHeader {
  record = input.required<IndexRecord>();
  vocabularies = input<string[]>([]);
}
