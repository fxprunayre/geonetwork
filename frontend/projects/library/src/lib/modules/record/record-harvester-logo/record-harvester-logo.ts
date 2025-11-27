import { Component, Input } from '@angular/core';
import { environment } from '../../../../environments/environment.sextant';

@Component({
  selector: 'app-record-harvester-logo',
  templateUrl: './record-harvester-logo.html',
  standalone: true,
})
export class RecordHarvesterLogo {
  @Input() logo: string | undefined = undefined;

  public apiBase = environment.geonetworkApiUrl;
}
