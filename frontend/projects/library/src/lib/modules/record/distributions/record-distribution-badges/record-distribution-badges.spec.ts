import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordDistributionBadges } from './record-distribution-badges';

describe('RecordDistributionBadges', () => {
  let component: RecordDistributionBadges;
  let fixture: ComponentFixture<RecordDistributionBadges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDistributionBadges],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDistributionBadges);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
