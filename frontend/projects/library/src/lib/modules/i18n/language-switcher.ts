import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidLanguage } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { selectI18nAppConfiguration } from '../config/app-config.selectors';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { I18nApp } from '../config/model/gnConfig';

interface Language {
  iso3code: string;
  iso2code: string;
}

@Component({
  selector: 'app-language-switcher',
  template: `
    @if (languages().length > 1) {
      <p-select
        [title]="'i18n.languageSwitcher.select' | translate"
        [options]="languages()"
        optionValue="iso3code"
        [(ngModel)]="currentLanguage"
      >
        <ng-template #selectedItem let-selectedOption>
          {{ 'languages.' + selectedOption.iso3code | translate }}
        </ng-template>
        <ng-template let-language #item>
          {{ 'languages.' + language.iso3code | translate }}
        </ng-template>
        <ng-template #dropdownicon>
          <ng-icon name="faSolidLanguage" />
        </ng-template>
      </p-select>
    }
  `,
  viewProviders: [provideIcons({ faSolidLanguage })],
  imports: [FormsModule, NgIcon, Select, TranslatePipe],
})
export class LanguageSwitcher {
  private translate = inject(TranslateService);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  i18nConfiguration = computed<I18nApp>(() => selectI18nAppConfiguration(this.appConfiguration()));
  languages = computed<Language[]>(() =>
    Object.entries(this.i18nConfiguration().languages).map(([iso3code, iso2code]) => ({
      iso3code,
      iso2code,
    })),
  );

  currentLanguage = signal(localStorage.getItem('lang') || this.i18nConfiguration().language);

  constructor() {
    effect(() => {
      const lang = this.currentLanguage();
      const config = this.i18nConfiguration();

      localStorage.setItem('lang', lang);
      this.translate.use(config.languages[lang]);
    });
  }
}
