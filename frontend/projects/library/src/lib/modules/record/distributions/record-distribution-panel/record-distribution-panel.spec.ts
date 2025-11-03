import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordDistributionPanel } from './record-distribution-panel';

describe('RecordDistributionPanel', () => {
  let component: RecordDistributionPanel;
  let fixture: ComponentFixture<RecordDistributionPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDistributionPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDistributionPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
