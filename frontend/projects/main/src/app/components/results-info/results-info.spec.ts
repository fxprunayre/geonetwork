import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_TEST_CONFIG,
  provideMockSearchService,
  provideMockTranslateService,
} from 'gn-library';
import { MessageService } from 'primeng/api';

import { ResultsInfo } from './results-info';

describe('Results', () => {
  let component: ResultsInfo;
  let fixture: ComponentFixture<ResultsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsInfo],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideRouter([]),
        MessageService,
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
