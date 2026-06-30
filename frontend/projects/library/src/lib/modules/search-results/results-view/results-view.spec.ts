import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { provideMockSearchService } from '../../search/search-store.mock';
import { ResultsView } from './results-view';

describe('ResultsView', () => {
  let component: ResultsView;
  let fixture: ComponentFixture<ResultsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsView],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
