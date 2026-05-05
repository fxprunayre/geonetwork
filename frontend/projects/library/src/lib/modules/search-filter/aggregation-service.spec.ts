import { TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { signal } from '@angular/core';
import { provideMockTranslateService } from '../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { provideMockSearchService } from '../search/search-store.mock.spec';
import { AggregationService } from './aggregation-service';

describe('AggregationService', () => {
  let service: AggregationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockSearchService(),
        provideMockTranslateService(),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
    });
    service = TestBed.inject(AggregationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
