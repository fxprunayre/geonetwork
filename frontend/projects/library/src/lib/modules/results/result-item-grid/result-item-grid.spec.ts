import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultItemGrid } from './result-item-grid';
import { provideMockSearchService } from '../../search/search.store.mock.spec';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';

describe('ResultItemGrid', () => {
  let component: ResultItemGrid;
  let fixture: ComponentFixture<ResultItemGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultItemGrid],
      providers: [provideMockSearchService(), provideMockTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultItemGrid);
    component = fixture.componentInstance;
    component.result = {
      uuid: 'test-uuid',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
