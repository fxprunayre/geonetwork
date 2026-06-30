import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWelcomeText } from './search-welcome-text';

import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { provideMockSearchService } from '../search-store.mock';

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
