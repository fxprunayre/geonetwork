import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationsPanel } from './aggregations-panel.component';

describe('AggregationsComponent', () => {
  let component: AggregationsPanel;
  let fixture: ComponentFixture<AggregationsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregationsPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
