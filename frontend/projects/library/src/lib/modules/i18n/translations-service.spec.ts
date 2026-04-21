import { TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { TranslationsService } from './translations-service';

describe('TranslationService', () => {
  let service: TranslationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) }],
    });
    service = TestBed.inject(TranslationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
