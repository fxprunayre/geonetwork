import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { of } from 'rxjs';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { provideMockSearchService } from '../../search/search-store.mock.spec';
import { ExplorePanel } from './explore-panel';

describe('ExplorePanel', () => {
  let component: ExplorePanel;
  let fixture: ComponentFixture<ExplorePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideMarkdown(),
        { provide: ActivatedRoute, useValue: { parent: null, queryParams: of({}) } },
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
      imports: [ExplorePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorePanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
