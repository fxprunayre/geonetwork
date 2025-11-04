import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultViewComponent } from './result-view-component';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';
import { provideMockSearchService } from '../../search/search.store.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('ResultViewComponent', () => {
  let component: ResultViewComponent;
  let fixture: ComponentFixture<ResultViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultViewComponent],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
