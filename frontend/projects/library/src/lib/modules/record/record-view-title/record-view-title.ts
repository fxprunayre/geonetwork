import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, TemplateRef } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordDistributionBadges } from '../../record-distributions/record-distribution-badges/record-distribution-badges';
import { RecordDeleteButton } from '../record-delete-button/record-delete-button';
import { RecordEditButton } from '../record-edit-button/record-edit-button';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { RecordMenuComponent } from '../record-menu/record-menu.component';

@Component({
  selector: 'app-record-view-title',
  imports: [
    NgTemplateOutlet,
    RecordDistributionBadges,
    RecordEditButton,
    RecordDeleteButton,
    RecordFieldType,
    RecordMenuComponent,
  ],
  template: `
    <ng-template #defaultBackButton />

    <div
      class="w-full bg-cover bg-bottom bg-no-repeat px-6 py-8"
      [class.bg-primary-400]="!backgroundImageUrl()"
      [class.bg-black]="backgroundImageUrl()"
      [style.background-image]="backgroundImageUrl() ? 'url(' + backgroundImageUrl() + ')' : null"
    >
      <div class="mx-auto max-w-7xl flex flex-col lg:gap-2">
        <div class="grow mb-4 flex flex-row gap-2 ">
          <h1 class="text-2xl sm:text-3xl md:text-4xl text-white font-bold grow">
            {{ record().resourceTitleObject?.['default'] }}
          </h1>

          <app-record-edit-button [record]="record()" />
          <app-record-delete-button [record]="record()" />

          <div>
            <ng-container
              *ngTemplateOutlet="backButtonTplRef() || defaultBackButton"
            ></ng-container>
          </div>
        </div>
        <div class="flex flex-row gap-3 items-center">
          <app-record-field-type
            [record]="record()"
            [withSpatialType]="true"
            class="text-xl text-white grow"
          />

          <app-record-distribution-badges
            [record]="record()"
            [types]="['api', 'download']"
            [layout]="'badge'"
          />

          <app-record-menu [record]="record()" />
        </div>
      </div>
    </div>
  `,
})
export class RecordViewTitle extends RecordFieldBase {
  backButtonTplRef = input<TemplateRef<unknown>>();

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  backgroundImageUrl = computed(() => this.appConfiguration().config?.backgroundImageUrl || '');
}
