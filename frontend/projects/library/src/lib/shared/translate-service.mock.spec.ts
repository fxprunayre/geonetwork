import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { Provider } from '@angular/core';

export function provideMockTranslateService(): Provider {
  const mockEvent = of({ lang: 'en', translations: {} }) as any;

  const translations: Record<string, string> = {
    'group-1': 'Odatis',
    dataset: 'Dataset',
  };

  return MockProvider(TranslateService, {
    get: (key: string | string[], interpolateParams?: object): Observable<any> => {
      if (Array.isArray(key)) {
        return of(key.join(' '));
      }
      return of(translations[key.toString()] || key.toString());
    },

    instant: (key: string) => translations[key.toString()] || key.toString(),

    onLangChange: mockEvent,
    onFallbackLangChange: mockEvent,
    onTranslationChange: mockEvent,
  });
}
