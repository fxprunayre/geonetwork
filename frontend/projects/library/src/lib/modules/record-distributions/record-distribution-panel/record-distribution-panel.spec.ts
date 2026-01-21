import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordDistributionPanel } from './record-distribution-panel';
import { APPLICATION_CONFIGURATION } from '../../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../../config/fixtures';

describe('RecordDistributionPanel', () => {
  let component: RecordDistributionPanel;
  let fixture: ComponentFixture<RecordDistributionPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDistributionPanel],
      providers: [{ provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG }],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDistributionPanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
