import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBase } from './search-base';
import { MockProvider } from 'ng-mocks';
import { TranslateService } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { provideMockSearchService } from '../search-store.mock.spec';

describe('SearchBase', () => {
  let component: SearchBase;
  let fixture: ComponentFixture<SearchBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBase],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
