import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import { Provider } from '@angular/core';

export function provideMockTranslateService(): Provider {
  const mockEvent = of({ lang: 'en', translations: {} });

  const translations: Record<string, string> = {
    'group-1': 'Odatis',
    dataset: 'Dataset',
    'search.aggregations.availableInViewService-availableInServices': 'View service',
  };

  return {
    provide: TranslateService,
    useValue: {
      get: (key: string | string[], _interpolateParams?: object): Observable<string> => {
        if (Array.isArray(key)) {
          return of(key.join(' '));
        }
        return of(translations[key.toString()] || key.toString());
      },
      instant: (key: string) => translations[key.toString()] || key.toString(),
      getParsedResult: (translations: unknown, key: unknown, _interpolateParams?: unknown) => key,
      addLangs: (_langs: string[]) => undefined,
      use: (_lang: string) => of(undefined),
      getCurrentLang: () => 'en',
      onLangChange: mockEvent,
      onFallbackLangChange: mockEvent,
      onTranslationChange: mockEvent,
      onDefaultLangChange: mockEvent,
    } as unknown as TranslateService,
  };
}
