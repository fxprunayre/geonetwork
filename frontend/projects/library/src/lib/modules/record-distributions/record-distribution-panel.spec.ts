import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Configuration as GnConfiguration } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { RecordDistributionPanel } from './record-distribution-panel';

import { signal } from '@angular/core';

describe('RecordDistributionPanel', () => {
  let component: RecordDistributionPanel;
  let fixture: ComponentFixture<RecordDistributionPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDistributionPanel],
      providers: [
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
      ],
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
