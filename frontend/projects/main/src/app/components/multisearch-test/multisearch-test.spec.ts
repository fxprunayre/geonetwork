import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  APPLICATION_CONFIGURATION,
  AuthenticationService,
  DEFAULT_TEST_CONFIG,
  provideMockSearchService,
  provideMockTranslateService,
} from 'gn-library';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { MultisearchTest } from './multisearch-test';

describe('MultisearchTest', () => {
  let component: MultisearchTest;
  let fixture: ComponentFixture<MultisearchTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultisearchTest],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideRouter([]),
        MessageService,
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
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

    fixture = TestBed.createComponent(MultisearchTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
