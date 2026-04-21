import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { provideMockTranslateService } from '../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { provideMockSearchService } from '../search/search-store.mock.spec';
import { DuckDbService } from './duck-db-service';

describe('DuckDbService', () => {
  let service: DuckDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
    });
    service = TestBed.inject(DuckDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
