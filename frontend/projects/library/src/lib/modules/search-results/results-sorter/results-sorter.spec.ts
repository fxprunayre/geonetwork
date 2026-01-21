import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsSorterComponent } from './results-sorter';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { provideMockSearchService } from '../../search/search-store.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('ResultsSorterComponent', () => {
  let component: ResultsSorterComponent;
  let fixture: ComponentFixture<ResultsSorterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsSorterComponent],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsSorterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
