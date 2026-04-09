import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationsService } from '../i18n/translations-service';
import { APPLICATION_CONFIGURATION } from './config.loader';

@Injectable({
  providedIn: 'root',
})
export class Gn4UrlService {
  private readonly appConfig = inject(APPLICATION_CONFIGURATION);
  private readonly translateService = inject(TranslateService);
  private readonly translationsService = inject(TranslationsService);

  getEditorUrl(targetPath: string): string {
    const defaultLang = this.translateService.getDefaultLang() || 'eng';
    const currentLang = this.translateService.currentLang || defaultLang;
    const langIso3 = this.translationsService.getIso3Code(currentLang);
    return `${this.appConfig().catalogueUrl}/srv/${langIso3}/catalog.edit#/${targetPath}`;
  }
}
