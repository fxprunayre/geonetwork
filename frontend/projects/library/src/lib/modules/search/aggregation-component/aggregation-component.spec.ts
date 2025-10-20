import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationComponent } from './aggregation-component';

describe('AggregationComponent', () => {
  let component: AggregationComponent;
  let fixture: ComponentFixture<AggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
