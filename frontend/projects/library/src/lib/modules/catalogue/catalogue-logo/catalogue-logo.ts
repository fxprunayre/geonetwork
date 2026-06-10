import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';

@Component({
  selector: 'app-catalogue-logo',
  imports: [Card, TranslatePipe, NgTemplateOutlet],
  template: `
    <ng-template #logoImg let-imgClass="imgClass" let-imgAlt="imgAlt">
      @if (logo()) {
        <img
          [src]="apiBase() + logo()"
          [alt]="imgAlt"
          onerror="this.style.display='none'"
          [class]="imgClass"
        />
      }
    </ng-template>

    @if (layout() === 'logo') {
      <ng-container
        *ngTemplateOutlet="logoImg; context: { imgClass: 'w-full h-full', imgAlt: catalogueName() }"
      ></ng-container>
    } @else if (layout() === 'logoWithLabel') {
      <p
        [title]="'record.field.catalogue.help' | translate"
        class="flex flex-row items-center gap-2 text-center"
      >
        <span class="hidden md:inline">{{ catalogueName() }}</span>
        <ng-container
          *ngTemplateOutlet="
            logoImg;
            context: {
              imgClass: 'h-12 my-4',
              imgAlt: 'record.field.catalogue.logo.alt' | translate,
            }
          "
        ></ng-container>
      </p>
    } @else {
      <p-card
        [header]="'record.field.catalogue.title' | translate"
        [subheader]="catalogueName()"
        [title]="'record.field.catalogue.help' | translate"
      >
        <p class="place-items-center">
          <ng-container
            *ngTemplateOutlet="
              logoImg;
              context: {
                imgClass: 'w-full h-full object-contain my-4',
                imgAlt: 'record.field.catalogue.logo.alt' | translate,
              }
            "
          ></ng-container>
        </p>
      </p-card>
    }
  `,
})
export class CatalogueLogo {
  layout = input<'logo' | 'logoWithLabel' | 'default'>('default');

  catalogueUuid = input<string>();

  catalogueName = computed(() => {
    const uuid = this.catalogueUuid();
    return uuid ? this.translateService.instant('source-' + uuid) : '';
  });

  logo = computed(() => {
    const uuid = this.catalogueUuid();
    return uuid ? `/srv/api/sources/${uuid}/logo` : '/srv/api/site/logo';
  });

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  translateService = inject(TranslateService);

  apiBase = computed(() => this.appConfiguration().catalogueUrl);
}
