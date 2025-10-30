import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationBucketDecorator } from './aggregation-bucket-decorator';

describe('AggregationBucketDecorator', () => {
  let component: AggregationBucketDecorator;
  let fixture: ComponentFixture<AggregationBucketDecorator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregationBucketDecorator],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationBucketDecorator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
