import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Aggregation } from './aggregation.component';

describe('AggregationComponent', () => {
  let component: Aggregation;
  let fixture: ComponentFixture<Aggregation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aggregation],
    }).compileComponents();

    fixture = TestBed.createComponent(Aggregation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
