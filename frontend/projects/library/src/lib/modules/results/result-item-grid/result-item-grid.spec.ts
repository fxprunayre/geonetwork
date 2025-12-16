import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';
import { provideMockSearchService } from '../../search/search.store.mock.spec';
import { ResultItemGrid } from './result-item-grid';

describe('ResultItemGrid', () => {
  let component: ResultItemGrid;
  let fixture: ComponentFixture<ResultItemGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultItemGrid],
      providers: [provideMockSearchService(), provideMockTranslateService(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultItemGrid);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('result', {
      uuid: 'test-uuid',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
