import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsPaginator } from './search-results-paginator';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';
import { provideMockSearchService } from '../../search/search.store.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('SearchResultsPaginator', () => {
  let component: SearchResultsPaginator;
  let fixture: ComponentFixture<SearchResultsPaginator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsPaginator],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsPaginator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
