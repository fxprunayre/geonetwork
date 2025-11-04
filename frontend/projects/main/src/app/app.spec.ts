import { TestBed } from '@angular/core/testing';
import { App } from './app';
import {
  provideMockTranslateService,
  createMockSearchService,
  APPLICATION_CONFIGURATION,
  DEFAULT_TEST_CONFIG,
} from 'gn-library';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideMockTranslateService(),
        createMockSearchService(),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
