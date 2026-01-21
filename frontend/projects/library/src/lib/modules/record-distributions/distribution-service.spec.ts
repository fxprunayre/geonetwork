import { TestBed } from '@angular/core/testing';

import { DistributionService } from './distribution-service';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('DistributionService', () => {
  let service: DistributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG }],
    });
    service = TestBed.inject(DistributionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
