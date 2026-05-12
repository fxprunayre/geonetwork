import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-harvester-logo',
  templateUrl: './record-harvester-logo.html',
  standalone: true,
  imports: [Card, TranslatePipe],
})
export class RecordHarvesterLogo extends RecordFieldBase {
  layout = input<'avatar' | 'default'>('default');

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  translateService = inject(TranslateService);

  apiBase = computed(() => this.appConfiguration().catalogueUrl);

  catalogueName = computed(() =>
    this.record().harvesterUuid
      ? this.translateService.instant('source-' + this.record().harvesterUuid)
      : this.record().sourceCatalogue
        ? this.translateService.instant('source-' + this.record().sourceCatalogue)
        : '',
  );
}
