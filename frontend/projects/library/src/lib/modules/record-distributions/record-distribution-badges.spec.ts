import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Configuration as GnConfiguration } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { RecordDistributionBadges } from './record-distribution-badges';

describe('RecordDistributionBadges', () => {
  let component: RecordDistributionBadges;
  let fixture: ComponentFixture<RecordDistributionBadges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDistributionBadges, TranslateModule.forRoot()],
      providers: [
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDistributionBadges);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
