import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { Provider } from '@angular/core';

export function provideMockTranslateService(): Provider {
  const mockEvent = of({ lang: 'en', translations: {} }) as any;

  const translations: Record<string, string> = {
    'group-1': 'Odatis',
    dataset: 'Dataset',
    'search.aggregations.availableInViewService-availableInServices': 'View service',
  };

  return {
    provide: TranslateService,
    useValue: {
      get: (key: string | string[], interpolateParams?: object): Observable<any> => {
        if (Array.isArray(key)) {
          return of(key.join(' '));
        }
        return of(translations[key.toString()] || key.toString());
      },
      instant: (key: string) => translations[key.toString()] || key.toString(),
      getParsedResult: (translations: any, key: any, interpolateParams?: any) => key,
      use: (lang: string) => of(undefined),
      getCurrentLang: () => 'en',
      onLangChange: mockEvent,
      onFallbackLangChange: mockEvent,
      onTranslationChange: mockEvent,
      onDefaultLangChange: mockEvent,
    },
  };
}
