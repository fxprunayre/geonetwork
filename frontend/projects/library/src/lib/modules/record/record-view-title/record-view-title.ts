import { NgStyle, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, TemplateRef } from '@angular/core';
import { ThemingService } from '../../../shared/theming-service';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { Bookmark } from '../../record-actions/bookmark/bookmark';
import { RecordDistributionBadges } from '../../record-distributions/record-distribution-badges/record-distribution-badges';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { RecordFieldCodelist } from '../record-field-codelist/record-field-codelist';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { RecordMenuComponent } from '../record-menu/record-menu.component';

@Component({
  selector: 'app-record-view-title',
  imports: [
    NgTemplateOutlet,
    NgStyle,
    RecordDistributionBadges,
    RecordFieldType,
    RecordMenuComponent,
    RecordFieldCodelist,
    Bookmark,
  ],
  template: `
    <ng-template #defaultBackButton />

    <div
      class="w-full bg-cover bg-bottom bg-no-repeat px-6 py-8"
      [class.bg-primary-400]="!bannerBackground()"
      [ngStyle]="bannerBackgroundStyle()"
      style="color: var(--app-background-text-color, #ffffff)"
    >
      <div class="mx-auto max-w-7xl flex flex-col lg:gap-2">
        <div class="grow mb-4 flex flex-row gap-2 ">
          <div class="grow flex items-start gap-1.5">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold">
              {{ record().resourceTitleObject?.['default'] }}
            </h1>
            <app-bookmark [record]="record()" />
          </div>
          <div>
            <ng-container
              *ngTemplateOutlet="backButtonTplRef() || defaultBackButton"
            ></ng-container>
          </div>
        </div>
        <div class="flex flex-row gap-3 items-center">
          <app-record-field-type [record]="record()" [mainTypeOnly]="true" />

          <app-record-field-codelist [record]="record()" codelist="cl_status" class="grow" />

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
  themingService = inject(ThemingService);

  bannerBackground = computed(() => this.appConfiguration().config?.apps?.banner?.background || '');

  bannerBackgroundStyle = computed(() =>
    this.themingService.getBannerBackgroundStyle(this.bannerBackground()),
  );
}
