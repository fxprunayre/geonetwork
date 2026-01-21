import {
  APPLICATION_CONFIGURATION,
  provideMockSearchService,
  DEFAULT_TEST_CONFIG,
  provideMockTranslateService,
  SearchStore,
} from 'gn-library';
import { Search } from './search';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { fireEvent, render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { signal } from '@angular/core';

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
    const hitsNumber = await screen.findByTestId('search-results-number');
    // expect(hitsNumber?.innerText).toBe('10 results');
  });
});
