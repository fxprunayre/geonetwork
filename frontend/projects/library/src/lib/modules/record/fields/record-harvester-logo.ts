import { Component, computed, input } from '@angular/core';
import { CatalogueLogo } from '../../catalogue/catalogue-logo';
import { RecordFieldBase } from '../base';

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
