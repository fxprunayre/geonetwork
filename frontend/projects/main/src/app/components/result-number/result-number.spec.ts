import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultNumber } from './result-number';

describe('ResultNumber', () => {
  let component: ResultNumber;
  let fixture: ComponentFixture<ResultNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultNumber);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
