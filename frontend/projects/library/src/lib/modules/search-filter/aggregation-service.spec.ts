import { TestBed } from '@angular/core/testing';

import { AggregationService } from './aggregation-service';
import { provideMockSearchService } from './search-store.mock.spec';
import { provideMockTranslateService } from '../../shared/translate-service.mock.spec';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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
