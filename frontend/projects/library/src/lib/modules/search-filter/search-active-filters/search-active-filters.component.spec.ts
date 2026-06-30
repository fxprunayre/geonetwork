import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchActiveFilters } from './search-active-filters.component';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideMockSearchService } from '../../search/search-store.mock';

describe('ActiveFilters', () => {
  let component: SearchActiveFilters;
  let fixture: ComponentFixture<SearchActiveFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchActiveFilters],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key.toUpperCase(),
            getCurrentLang: () => 'en',
            getParsedResult: (
              translations: Record<string, unknown>,
              key: string,
              _interpolateParams?: Record<string, unknown>,
            ) => key,
            get: (key: string) => of(key),
            onTranslationChange: of(),
            onLangChange: of(),
            onDefaultLangChange: of(),
          },
        },
        provideHttpClientTesting(),
        provideMockSearchService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchActiveFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
