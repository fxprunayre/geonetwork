import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchActiveFilters } from './search-active-filters.component';
import { MockProvider } from 'ng-mocks';
import { TranslateService } from '@ngx-translate/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockSearchService } from '../../search/search.store.mock.spec';

describe('ActiveFilters', () => {
  let component: SearchActiveFilters;
  let fixture: ComponentFixture<SearchActiveFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchActiveFilters],
      providers: [
        MockProvider(TranslateService, {
          instant: (key: string) => key.toUpperCase(),
        }),
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
