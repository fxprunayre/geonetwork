import { TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { Configuration as GnConfiguration } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { ConfigService } from './config-service';
import { APPLICATION_CONFIGURATION } from './config.loader';
import { DEFAULT_TEST_CONFIG } from './fixtures';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
      ],
    });
    service = TestBed.inject(ConfigService);
  });

  it('should parse a single filter expression correctly', () => {
    const filters = 'protocol:OGC:.*';
    const result = service.parseFilterExpression(filters);
    expect(result).toEqual([{ field: 'protocol', regex: /OGC:.*/, not: false }]);
  });

  it('should parse multiple filter expressions correctly', () => {
    const filters = 'protocol:OGC:.*|ESRI:.* AND function:legend|featureCatalogue';
    const result = service.parseFilterExpression(filters);
    expect(result).toEqual([
      { field: 'protocol', regex: /OGC:.*|ESRI:.*/, not: false },
      { field: 'function', regex: /legend|featureCatalogue/, not: false },
    ]);
  });

  it('should parse negated filter expressions correctly', () => {
    const filters = '-protocol:OGC:.*|ESRI:.*';
    const result = service.parseFilterExpression(filters);
    expect(result).toEqual([{ field: 'protocol', regex: /OGC:.*|ESRI:.*/, not: true }]);
  });

  it('should return an empty array for an empty filter string', () => {
    const filters = '';
    const result = service.parseFilterExpression(filters);
    expect(result).toEqual([]);
  });

  it('should return an empty array for a filter string with only AND', () => {
    const filters = ' AND ';
    const result = service.parseFilterExpression(filters);
    expect(result).toEqual([]);
  });
});
