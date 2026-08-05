import { Component, computed, inject } from '@angular/core';
import { selectRecordAppConfiguration } from '../../config/app-config.selectors';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordFieldBase } from '../../record';
import { DistributionService } from '../distribution-service';

@Component({
  selector: 'app-record-distribution-field-base',
  imports: [],
  template: '',
})
export class RecordDistributionFieldBase extends RecordFieldBase {
  distributionService = inject(DistributionService);
  appConfiguration = inject(APPLICATION_CONFIGURATION);

  distributionConfig = computed(
    () => selectRecordAppConfiguration(this.appConfiguration()).distribution,
  );

  links = computed(() => {
    return this.record()?.link || [];
  });

  linksBySections = computed(() => {
    return this.distributionService.linksBySections(this.links());
  });
}
