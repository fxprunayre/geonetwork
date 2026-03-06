import { Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPenToSquare } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { AuthStore } from '../../authentication/auth.store';
import { TranslationsService } from '../../i18n/translations-service';

@Component({
  selector: 'app-record-edit-button',
  template: `
    @if (isAuthenticated()) {
      <a
        pButton
        [attr.href]="editorUrl()"
        [title]="'record.action.editTitle' | translate"
        target="_blank"
      >
        <ng-icon name="faSolidPenToSquare" pButtonIcon></ng-icon>
        <span pButtonLabel>{{ 'record.action.edit' | translate }}</span>
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
export class RecordEditButton extends RecordFieldBase {
  private readonly translate = inject(TranslateService);
  private readonly translationsService = inject(TranslationsService);
  private authStore = inject(AuthStore);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);
  currentLang = signal(this.translate.getCurrentLang());

  isAuthenticated = computed(() => this.authStore.isAuthenticated());

  editorUrl = computed(() => {
    const uuid = this.record().uuid;
    if (!uuid) {
      return '';
    }
    const iso3Lang = this.translationsService.getIso3Code(this.currentLang());
    return `${this.catalogueUrl()}/srv/${iso3Lang}/catalog.edit#/metadata/${uuid}`;
  });
}
