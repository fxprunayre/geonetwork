import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultItemList } from './result-item-list';

describe('ResultItemList', () => {
  let component: ResultItemList;
  let fixture: ComponentFixture<ResultItemList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultItemList],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultItemList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
