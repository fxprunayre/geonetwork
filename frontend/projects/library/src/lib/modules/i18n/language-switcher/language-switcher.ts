import { Component, effect, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { I18nApp } from '../../config/model/gnConfig';
import { APPLICATION_CONFIGURATION, DEFAULT_LANGUAGE } from '../../config/config.loader';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.html',
  imports: [TranslatePipe, Select, FormsModule],
})
export class LanguageSwitcher {
  private translate = inject(TranslateService);

  i18nConfiguration: I18nApp = inject(APPLICATION_CONFIGURATION).config?.apps.i18n ?? {
    enabled: true,
    language: DEFAULT_LANGUAGE,
    languages: { DEFAULT_LANGUAGE: DEFAULT_LANGUAGE.substring(0, 2) },
  };

  languages = Object.entries(this.i18nConfiguration.languages).map(([key, value]) => ({
    iso3code: key,
    iso2code: value,
    label: key,
  }));

  currentLanguage = signal(localStorage.getItem('lang') || this.i18nConfiguration.language);

  constructor() {
    effect(() => {
      const lang = this.currentLanguage();

      localStorage.setItem('lang', lang);
      this.translate.use(this.i18nConfiguration.languages[lang]);

      this.translate
        .get(this.languages.map((language) => 'languages.' + language.iso3code))
        .subscribe((translations: { [key: string]: string }) => {
          this.languages = this.languages.map((language) => ({
            ...language,
            label: translations['languages.' + language.iso3code] || language.iso3code,
          }));
        });
    });
  }
}
