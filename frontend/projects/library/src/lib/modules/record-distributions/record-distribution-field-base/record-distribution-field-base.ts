import { Component, computed, inject } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordFieldBase } from '../../record/record-field-base/record-field-base';
import { DistributionService } from '../distribution-service';

@Component({
  selector: 'app-record-distribution-field-base',
  imports: [],
  template: '',
})
export class RecordDistributionFieldBase extends RecordFieldBase {
  distributionService = inject(DistributionService);
  appConfiguration = inject(APPLICATION_CONFIGURATION);

  distributionConfig = computed(() => this.appConfiguration().config?.apps.record?.distribution);

  links = computed(() => {
    return this.record()?.link || [];
  });

  linksBySections = computed(() => {
    return this.distributionService.linksBySections(this.links());
  });
}
