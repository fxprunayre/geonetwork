import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { MarkdownPipe } from 'ngx-markdown';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { selectRecordAppConfiguration } from '../../config/app-config.selectors';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import {
  RecordFieldBase,
  RecordFieldDoi,
  RecordFieldOverviewComponent,
  RecordFieldResourceLastUpdate,
  RecordFieldVocabulary,
  RecordHarvesterLogo,
  RecordVersions,
} from '../field-components';

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
  appConfiguration = inject(APPLICATION_CONFIGURATION);

  private recordConfig = computed(() => selectRecordAppConfiguration(this.appConfiguration()));

  showVersionWidgets = computed(() => this.recordConfig().showVersionWidgets ?? true);

  vocabularies = input<string[]>([]);
  recordClick = output<string>();
}
