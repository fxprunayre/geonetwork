import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { signal } from '@angular/core';
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
import { routes } from '../../app.routes';
import { Search } from './search';

describe('Search', () => {
  it('should provide a search box', async () => {
    await render(Search, {
      providers: [
        SearchStore,
        provideMockTranslateService(),
        provideMockSearchService(),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
    });
    const user = userEvent.setup();

    // const searchBox = screen.getByTestId('search-input');
    const searchBox = screen.getByRole('textbox');
    expect(searchBox).toBeTruthy();
    await user.type(searchBox, 'surval');

    const searchButton = screen.getByTestId('search-input-button');
    expect(searchButton).toBeTruthy();
    await user.click(searchButton);

    console.log(searchBox);
    // screen.debug();
    await screen.findByTestId('search-results-number');
    // expect(hitsNumber?.innerText).toBe('10 results');
  });
});
