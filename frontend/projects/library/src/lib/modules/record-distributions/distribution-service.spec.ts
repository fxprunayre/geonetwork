import { TestBed } from '@angular/core/testing';

import { Configuration as GnConfiguration } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { DistributionService } from './distribution-service';

describe('DistributionService', () => {
  let service: DistributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
      ],
    });
    service = TestBed.inject(DistributionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
