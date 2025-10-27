import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsNumber } from './search-results-number.component';

describe('ResultNumber', () => {
  let component: SearchResultsNumber;
  let fixture: ComponentFixture<SearchResultsNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
