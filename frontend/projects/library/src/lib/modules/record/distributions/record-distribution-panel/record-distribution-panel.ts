import { Component } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { Link } from 'gn-api-client';
import { RecordDistributionFieldBase } from '../record-distribution-field-base/record-distribution-field-base';

@Component({
  selector: 'app-record-distribution-panel',
  imports: [KeyValuePipe, Badge, Button],
  templateUrl: './record-distribution-panel.html',
})
export class RecordDistributionPanel extends RecordDistributionFieldBase {
  addWmsLayers = (link: Link[]) => {
    // TODO
  };
}
