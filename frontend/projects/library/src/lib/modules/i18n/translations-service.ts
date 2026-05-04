import { inject, Injectable } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';

const ISO3_TO_ISO2: Record<string, string> = {
  eng: 'en',
  fre: 'fr',
  ger: 'de',
  spa: 'es',
  por: 'pt',
  ita: 'it',
  dut: 'nl',
  nld: 'nl',
  pol: 'pl',
  rus: 'ru',
  ara: 'ar',
  zho: 'zh',
  chi: 'zh',
  jpn: 'ja',
  kor: 'ko',
  swe: 'sv',
  nor: 'no',
  dan: 'da',
  fin: 'fi',
  ces: 'cs',
  cze: 'cs',
  slk: 'sk',
  hun: 'hu',
  ron: 'ro',
  rum: 'ro',
  bul: 'bg',
  hrv: 'hr',
  srp: 'sr',
  slv: 'sl',
  tur: 'tr',
  vie: 'vi',
  tha: 'th',
  ind: 'id',
  msa: 'ms',
  mal: 'ms',
  ukr: 'uk',
  cat: 'ca',
  eus: 'eu',
  glg: 'gl',
};

/**
 * Converts an ISO 639-2/T 3-letter language code to its ISO 639-1 2-letter equivalent.
 * Falls back to the input value unchanged when not found.
 */
export function iso3ToIso2(iso3code: string): string {
  return ISO3_TO_ISO2[iso3code.toLowerCase()] ?? iso3code;
}

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
    return languages[iso3code] || iso3ToIso2(iso3code);
  }
}
