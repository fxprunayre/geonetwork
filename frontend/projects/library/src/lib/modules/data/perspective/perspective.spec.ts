vi.mock('@perspective-dev/viewer-d3fc', () => ({}));
vi.mock('@perspective-dev/viewer-datagrid', () => ({}));
vi.mock('@perspective-dev/viewer-openlayers', () => ({}));
vi.mock('@perspective-dev/workspace', () => ({}));
vi.mock('@perspective-dev/client', () => ({ default: { init_server: vi.fn() } }));
vi.mock('@perspective-dev/viewer', () => ({ default: { init_client: vi.fn() } }));

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { provideMarkdown } from 'ngx-markdown';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { provideMockSearchService } from '../../search/search-store.mock';
import { Perspective } from './perspective';

describe('Perspective', () => {
  let component: Perspective;
  let fixture: ComponentFixture<Perspective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideMarkdown(),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
      imports: [Perspective],
    }).compileComponents();

    fixture = TestBed.createComponent(Perspective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
