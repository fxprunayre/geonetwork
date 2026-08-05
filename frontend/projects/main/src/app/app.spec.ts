import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Configuration as GnConfiguration } from 'gn-api-client';
import {
  APPLICATION_CONFIGURATION,
  AuthenticationService,
  createMockSearchService,
  DEFAULT_TEST_CONFIG,
  provideMockTranslateService,
  SearchService,
} from 'gn-library';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    TestBed.overrideComponent(App, {
      remove: { providers: [SearchService] },
      add: { providers: [createMockSearchService()] },
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideMockTranslateService(),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        MessageService,
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
        {
          provide: AuthenticationService,
          useValue: {
            signIn: () => of(null),
            signOut: () => of(null),
            getUserInfo: () => of(null),
            getAuthenticationProviders: () => of([]),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
