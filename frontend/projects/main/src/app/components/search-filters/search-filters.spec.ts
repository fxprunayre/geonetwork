import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { SearchFilters } from './search-filters';

describe('SearchFilters', () => {
  let component: SearchFilters;
  let fixture: ComponentFixture<SearchFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilters],
      providers: [
        MockProvider(TranslateService, {
          instant: (key: string) => key.toUpperCase(),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
