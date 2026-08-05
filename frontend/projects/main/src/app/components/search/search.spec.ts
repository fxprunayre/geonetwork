import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_TEST_CONFIG,
  provideMockSearchService,
  provideMockTranslateService,
  SearchStore,
} from 'gn-library';
import { MessageService } from 'primeng/api';
import { routes } from '../../app.routes';
import { ResultsInfo } from '../results-info/results-info';
import { SearchFilters } from '../search-filters/search-filters';
import { Search } from './search';

describe('Search', () => {
  it('should provide a search box', async () => {
    TestBed.overrideComponent(ResultsInfo, {
      set: {
        template: '',
        imports: [],
      },
    });
    TestBed.overrideComponent(SearchFilters, {
      set: {
        template: '',
        imports: [],
      },
    });

    await render(Search, {
      providers: [
        SearchStore,
        provideMockTranslateService(),
        provideMockSearchService(),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        MessageService,
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
    });
    const user = userEvent.setup();

    const searchBox = screen.getByRole('combobox', { name: '' });
    expect(searchBox).toBeTruthy();
    await user.type(searchBox, 'surval');

    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).toBeTruthy();
    await user.click(searchButton);

    expect((searchBox as HTMLInputElement).value).toBe('surval');
  });
});
