vi.mock('@perspective-dev/viewer-d3fc', () => ({}));
vi.mock('@perspective-dev/viewer-datagrid', () => ({}));
vi.mock('@perspective-dev/viewer-openlayers', () => ({}));
vi.mock('@perspective-dev/workspace', () => ({}));
vi.mock('@perspective-dev/client', () => ({ default: { init_server: vi.fn() } }));
vi.mock('@perspective-dev/viewer', () => ({ default: { init_client: vi.fn() } }));

import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { provideMockTranslateService } from '../../shared/translate-service.mock';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { provideMockSearchService } from '../search/search-store.mock';
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
