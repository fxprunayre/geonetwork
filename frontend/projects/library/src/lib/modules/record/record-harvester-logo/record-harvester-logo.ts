import { Component, computed, input } from '@angular/core';
import { CatalogueLogo } from '../../catalogue/catalogue-logo/catalogue-logo';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-harvester-logo',
  standalone: true,
  imports: [CatalogueLogo],
  template: `
    @if (catalogueUuid()) {
      <app-catalogue-logo [layout]="layout()" [catalogueUuid]="catalogueUuid()">
      </app-catalogue-logo>
    }
  `,
})
export class RecordHarvesterLogo extends RecordFieldBase {
  layout = input<'logo' | 'logoWithLabel' | 'default'>('default');

  catalogueUuid = computed(() =>
    this.record().harvesterUuid
      ? this.record().harvesterUuid
      : this.record().sourceCatalogue
        ? this.record().sourceCatalogue
        : '',
  );
}
