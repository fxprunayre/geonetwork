import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Configuration as GnConfiguration } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';

import { provideMockTranslateService } from '../../shared/translate-service.mock';
import { AuthStore } from '../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { FeedbackPanel } from './feedback-panel';

describe('FeedbackPanel', () => {
  let component: FeedbackPanel;
  let fixture: ComponentFixture<FeedbackPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackPanel],
      providers: [
        provideMockTranslateService(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null,
              },
            },
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: () => false,
            user: () => null,
          },
        },
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
