import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationsComponent } from './aggregations-component';

describe('AggregationsComponent', () => {
  let component: AggregationsComponent;
  let fixture: ComponentFixture<AggregationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
