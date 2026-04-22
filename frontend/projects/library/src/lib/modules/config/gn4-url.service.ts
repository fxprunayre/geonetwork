import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationsService } from '../i18n/translations-service';
import { APPLICATION_CONFIGURATION } from './config.loader';
import { DEFAULT_SPACE } from './gn-constants';

@Injectable({
  providedIn: 'root',
})
export class Gn4UrlService {
  private readonly appConfig = inject(APPLICATION_CONFIGURATION);
  private readonly translateService = inject(TranslateService);
  private readonly translationsService = inject(TranslationsService);

  private getCurrentLangIso3(): string {
    const defaultLang = this.translateService.getDefaultLang() || 'eng';
    const currentLang = this.translateService.getCurrentLang() || defaultLang;
    return this.translationsService.getIso3Code(currentLang);
  }

  getEditorUrl(targetPath: string): string {
    const langIso3 = this.getCurrentLangIso3();
    return `${this.appConfig().catalogueUrl}/${DEFAULT_SPACE}/${langIso3}/catalog.edit#/${targetPath}`;
  }

  getAdminConsoleUrl(): string {
    const langIso3 = this.getCurrentLangIso3();
    return `${this.appConfig().catalogueUrl}/${DEFAULT_SPACE}/${langIso3}/admin.console`;
  }
}
