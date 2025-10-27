import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationBucket } from './aggregation-bucket';

describe('AggregationBucket', () => {
  let component: AggregationBucket;
  let fixture: ComponentFixture<AggregationBucket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregationBucket],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationBucket);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
