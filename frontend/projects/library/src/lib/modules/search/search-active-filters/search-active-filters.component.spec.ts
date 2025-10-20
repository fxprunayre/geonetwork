import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchActiveFilters } from './search-active-filters.component';

describe('ActiveFilters', () => {
  let component: SearchActiveFilters;
  let fixture: ComponentFixture<SearchActiveFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchActiveFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchActiveFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
