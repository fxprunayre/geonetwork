import { TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideMockTranslateService } from '../../shared/translate-service.mock.spec';
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
      ],
    });
    service = TestBed.inject(AggregationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
