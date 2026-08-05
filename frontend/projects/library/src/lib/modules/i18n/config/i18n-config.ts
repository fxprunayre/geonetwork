import { I18nApp } from '../../config/model/gnConfig';

export const DEFAULT_LANGUAGE = 'eng';

export const DEFAULT_HEADER_APP_CONFIGURATION: I18nApp = {
  enabled: true,
  languages: {
    eng: 'en',
    fre: 'fr',
  },
  language: DEFAULT_LANGUAGE,
};
