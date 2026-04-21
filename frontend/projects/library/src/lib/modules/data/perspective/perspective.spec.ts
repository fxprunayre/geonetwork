import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { provideMarkdown } from 'ngx-markdown';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { provideMockSearchService } from '../../search/search-store.mock.spec';
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
