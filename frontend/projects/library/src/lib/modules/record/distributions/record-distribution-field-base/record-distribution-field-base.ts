import { Component, computed, inject } from '@angular/core';
import { RecordFieldBase } from '../../record-field-base/record-field-base';
import { APPLICATION_CONFIGURATION } from '../../../config/config.loader';
import { DistributionService } from '../distribution.service';

@Component({
  selector: 'app-record-distribution-field-base',
  imports: [],
  template: '',
})
export class RecordDistributionFieldBase extends RecordFieldBase {
  distributionConfig = inject(APPLICATION_CONFIGURATION).config?.apps.record?.distribution;

  distributionService = inject(DistributionService);

  links = computed(() => {
    return this.record()?.link || [];
  });

  linksBySections = computed(() => {
    return this.distributionService.linksBySections(this.links());
  });
}
