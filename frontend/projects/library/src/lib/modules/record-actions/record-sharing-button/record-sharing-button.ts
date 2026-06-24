import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPenToSquare } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { AuthStore } from '../../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { Gn4UrlService } from '../../config/gn4-url.service';
import { TranslationsService } from '../../i18n/translations-service';
import { RecordFieldBase } from '../../record/record-field-base/record-field-base';

@Component({
  selector: 'app-record-sharing-button',
  template: `
    @if (isAuthenticated()) {
      <a pButton [title]="'record.action.sharing.title' | translate" target="_blank">
        <ng-icon name="faSolidPenToSquare" pButtonIcon></ng-icon>
        <span pButtonLabel>{{ 'record.action.sharing.label' | translate }}</span>
      </a>
    }
  `,
  standalone: true,
  imports: [ButtonModule, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidPenToSquare,
    }),
  ],
})
export class RecordSharingButton extends RecordFieldBase {
  private readonly translate = inject(TranslateService);
  private readonly translationsService = inject(TranslationsService);
  private authStore = inject(AuthStore);
  private gn4UrlService = inject(Gn4UrlService);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);
  currentLang = signal(this.translate.getCurrentLang());

  isAuthenticated = computed(() => {
    return this.authStore.isAuthenticated();
  });
}
