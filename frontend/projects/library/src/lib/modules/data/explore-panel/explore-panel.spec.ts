vi.mock('@perspective-dev/viewer-d3fc', () => ({}));
vi.mock('@perspective-dev/viewer-datagrid', () => ({}));
vi.mock('@perspective-dev/viewer-openlayers', () => ({}));
vi.mock('@perspective-dev/workspace', () => ({}));
vi.mock('@perspective-dev/client', () => ({ default: { init_server: vi.fn() } }));
vi.mock('@perspective-dev/viewer', () => ({ default: { init_client: vi.fn() } }));

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideMarkdown } from 'ngx-markdown';
import { of } from 'rxjs';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { provideMockSearchService } from '../../search/search-store.mock';
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
