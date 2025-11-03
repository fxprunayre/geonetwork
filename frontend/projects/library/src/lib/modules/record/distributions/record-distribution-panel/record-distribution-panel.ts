import { Component, computed, inject } from '@angular/core';
import { RecordFieldBase } from '../../record-field-base/record-field-base';
import { JsonPipe, KeyValuePipe } from '@angular/common';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';
import { APPLICATION_CONFIGURATION } from '../../../config/config.loader';
import { Link } from 'gn-api-client';
import { DistributionService } from '../distribution.service';

@Component({
  selector: 'app-record-distribution-panel',
  imports: [KeyValuePipe, Badge, Button, JsonPipe],
  templateUrl: './record-distribution-panel.html',
  styleUrl: './record-distribution-panel.scss',
})
export class RecordDistributionPanel extends RecordFieldBase {
  distributionConfig = inject(APPLICATION_CONFIGURATION).config?.apps.record?.distribution;

  distributionService = inject(DistributionService);

  links = computed(() => {
    return this.record()?.link || [];
  });

  linksBySections = computed(() => {
    return this.distributionService.linksBySections(this.links());
  });

  addWmsLayers = (link: Link[]) => {
    // TODO
  };
}
