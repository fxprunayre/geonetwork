import { NgStyle } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';
import { ThemingService } from '../../../shared/theming-service';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';

@Component({
  selector: 'app-record-view-skeleton',
  imports: [Skeleton, NgStyle],
  template: `<div
      class="w-full bg-cover bg-bottom bg-no-repeat px-6 py-8"
      [class.bg-primary-400]="!bannerBackground()"
      [ngStyle]="bannerBackgroundStyle()"
      style="color: var(--app-background-text-color, #ffffff)"
    >
      <div class="mx-auto max-w-7xl flex flex-col lg:gap-2">
        <div class="grow mb-4 flex flex-row gap-2 ">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold grow">
            <p-skeleton width="100%" height="3rem" />
          </h1>
        </div>

        <p-skeleton width="20%" height="2rem" />
      </div>
    </div>
    <div class="mx-auto max-w-7xl p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1">
          <div class="">
            <p-skeleton width="100%" height="20rem" />
          </div>
        </div>
        <div class="md:col-span-2 flex flex-col gap-2">
          <p-skeleton width="100%" height="1rem" />
          <p-skeleton width="60%" height="1rem" class="mb-4" />
          <p-skeleton width="100%" height="1rem" />
          <p-skeleton width="100%" height="1rem" />
          <p-skeleton width="100%" height="1rem" />
          <p-skeleton width="80%" height="1rem" />
        </div>
      </div>

      <div class="flex flex-row gap-3 items-center border-t-2 border-surface-50 p-4">
        <div class="grow flex flex-row gap-2 font-medium text-surface-700">
          <p-skeleton width="30%" height="1rem" />
        </div>
      </div>
    </div> `,
})
export class RecordViewSkeleton {
  appConfiguration = inject(APPLICATION_CONFIGURATION);
  themingService = inject(ThemingService);

  bannerBackground = computed(() => this.appConfiguration().config?.bannerBackground || '');

  bannerBackgroundStyle = computed(() =>
    this.themingService.getBannerBackgroundStyle(this.bannerBackground()),
  );
}
