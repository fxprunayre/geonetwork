import { Component, computed, effect, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { I18nApp } from '../../config/model/gnConfig';
import { APPLICATION_CONFIGURATION, DEFAULT_LANGUAGE } from '../../config/config.loader';

interface Language {
  iso3code: string;
  iso2code: string;
  label: string;
}

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.html',
  imports: [TranslatePipe, Select, FormsModule],
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

  languages = signal<Language[]>([]);

  currentLanguage = signal(localStorage.getItem('lang') || this.i18nConfiguration().language);

  constructor() {
    effect(() => {
      const lang = this.currentLanguage();
      const config = this.i18nConfiguration();

      localStorage.setItem('lang', lang);
      this.translate.use(config.languages[lang]);

      const languages = Object.entries(config.languages).map(([key, value]) => ({
        iso3code: key,
        iso2code: value,
        label: key,
      }));

      this.translate
        .get(languages.map((language) => 'languages.' + language.iso3code))
        .subscribe((translations: { [key: string]: string }) => {
          this.languages.set(
            languages.map((language) => ({
              ...language,
              label: translations['languages.' + language.iso3code] || language.iso3code,
            })),
          );
        });
      this.appConfiguration.update((appConfig) => {
        if (appConfig.config?.apps?.i18n) {
          appConfig.config.apps.i18n.language = lang;
        }
        return { ...appConfig };
      });
    });
  }
}
