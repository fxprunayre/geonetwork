import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { Configuration as GnConfiguration } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { RecordDistributionFieldBase } from './record-distribution-field-base';

describe('RecordDistributionFieldBase', () => {
  let component: RecordDistributionFieldBase;
  let fixture: ComponentFixture<RecordDistributionFieldBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDistributionFieldBase],
      providers: [
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDistributionFieldBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
