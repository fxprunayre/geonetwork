import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultItemList } from './result-item-list';
import { provideMockSearchService } from '../../search/search.store.mock.spec';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';

describe('ResultItemList', () => {
  let component: ResultItemList;
  let fixture: ComponentFixture<ResultItemList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultItemList],
      providers: [provideMockSearchService(), provideMockTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultItemList);
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
