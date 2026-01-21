import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultView } from './results-view';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { provideMockSearchService } from '../../search/search-store.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('ResultView', () => {
  let component: ResultView;
  let fixture: ComponentFixture<ResultView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultView],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
