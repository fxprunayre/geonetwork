import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  APPLICATION_CONFIGURATION,
  createMockSearchService,
  DEFAULT_TEST_CONFIG,
  provideMockTranslateService,
} from 'gn-library';
import { App } from './app';
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
