import { inject, Injectable } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';

@Injectable({
  providedIn: 'root',
})
export class TranslationsService {
  private readonly appConfiguration = inject(APPLICATION_CONFIGURATION);

  getIso3Code(iso2code: string): string {
    const config = this.appConfiguration();
    const languages = config.config?.apps?.i18n?.languages || {};
    // Languages is an object like { eng: 'en', fre: 'fr' }
    return Object.keys(languages).find((key) => languages[key] === iso2code) || iso2code;
  }

  getIso2Code(iso3code: string): string {
    const config = this.appConfiguration();
    const languages = config.config?.apps?.i18n?.languages || {};
    return languages[iso3code] || iso3code;
  }
}
