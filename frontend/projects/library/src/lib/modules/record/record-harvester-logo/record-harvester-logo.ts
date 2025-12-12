import { Component, computed, inject } from '@angular/core';
import { Card } from 'primeng/card';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { TranslatePipe } from '@ngx-translate/core';

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
