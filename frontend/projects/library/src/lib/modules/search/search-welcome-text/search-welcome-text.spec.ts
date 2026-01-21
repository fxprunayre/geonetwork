import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWelcomeText } from './search-welcome-text';
import { MockProvider } from 'ng-mocks';
import { TranslateService } from '@ngx-translate/core';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { provideMockSearchService } from '../search-store.mock.spec';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('SearchWelcomeText', () => {
  let component: SearchWelcomeText;
  let fixture: ComponentFixture<SearchWelcomeText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchWelcomeText],
      providers: [provideMockTranslateService(), provideMockSearchService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchWelcomeText);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
