import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Configuration as GnConfiguration } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { provideMarkdown } from 'ngx-markdown';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { provideMockSearchService } from '../../search/search-store.mock';
import { ResultItemGrid } from './result-item-grid';

describe('ResultItemGrid', () => {
  let component: ResultItemGrid;
  let fixture: ComponentFixture<ResultItemGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultItemGrid],
      providers: [
        provideMockSearchService(),
        provideMockTranslateService(),
        provideRouter([]),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
        provideMarkdown(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultItemGrid);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('result', {
      uuid: 'test-uuid',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
