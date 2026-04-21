import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsInfo } from './results-info';

describe('Results', () => {
  let component: ResultsInfo;
  let fixture: ComponentFixture<ResultsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
