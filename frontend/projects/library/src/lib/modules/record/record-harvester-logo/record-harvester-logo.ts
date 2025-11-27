import { Component, inject } from '@angular/core';
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
  apiBase = inject(APPLICATION_CONFIGURATION).catalogueUrl;
}
