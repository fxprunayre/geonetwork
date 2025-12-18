import { Component, computed, effect, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { I18nApp } from '../../config/model/gnConfig';
import { APPLICATION_CONFIGURATION, DEFAULT_LANGUAGE } from '../../config/config.loader';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidLanguage } from '@ng-icons/font-awesome/solid';

interface Language {
  iso3code: string;
  iso2code: string;
}

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.html',
  viewProviders: [provideIcons({ faSolidLanguage })],
  imports: [TranslatePipe, Select, NgIcon, FormsModule],
})
export class LanguageSwitcher {
  private translate = inject(TranslateService);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  i18nConfiguration = computed<I18nApp>(
    () =>
      this.appConfiguration().config?.apps.i18n ?? {
        enabled: true,
        language: DEFAULT_LANGUAGE,
        languages: { DEFAULT_LANGUAGE: DEFAULT_LANGUAGE.substring(0, 2) },
      },
  );
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
