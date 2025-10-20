import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsPaginator } from './search-results-paginator';

describe('SearchResultsPaginator', () => {
  let component: SearchResultsPaginator;
  let fixture: ComponentFixture<SearchResultsPaginator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsPaginator],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsPaginator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
