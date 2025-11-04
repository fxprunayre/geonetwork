import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsNumber } from './search-results-number.component';
import { provideMockSearchService } from '../../search/search.store.mock.spec';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';

describe('ResultNumber', () => {
  let component: SearchResultsNumber;
  let fixture: ComponentFixture<SearchResultsNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsNumber],
      providers: [provideMockSearchService(), provideMockTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
