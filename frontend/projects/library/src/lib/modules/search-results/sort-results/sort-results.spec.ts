import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortResults } from './sort-results';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';
import { provideMockSearchService } from '../../search/search.store.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('SortResults', () => {
  let component: SortResults;
  let fixture: ComponentFixture<SortResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortResults],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SortResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
