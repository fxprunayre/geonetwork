import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
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
  appConfiguration = inject(APPLICATION_CONFIGURATION);
  apiBase = computed(() => this.appConfiguration().catalogueUrl);
}
