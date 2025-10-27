import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultItemGrid } from './result-item-grid';

describe('ResultItemGrid', () => {
  let component: ResultItemGrid;
  let fixture: ComponentFixture<ResultItemGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultItemGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultItemGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
