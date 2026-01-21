import { SearchInput } from './search-input';
import { fireEvent, render, screen } from '@testing-library/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SearchStoreType } from '../search-store';
import { provideMockSearchService, createMockSearchStore } from '../search-store.mock.spec';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { inputBinding, outputBinding } from '@angular/core';
import userEvent from '@testing-library/user-event';

describe('SearchInput', () => {
  let mockStore: SearchStoreType;

  const onSearch = jasmine.createSpy('onSearch');

  const renderSearchInput = (bindings?: any[]) => {
    mockStore = createMockSearchStore();
    return render(SearchInput, {
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(mockStore),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG },
      ],
      bindings,
    });
  };

  beforeEach(() => {
    onSearch.calls.reset();
  });

  it('should create with an input with focus in', async () => {
    await renderSearchInput();
    const searchBox = screen.getByTestId('search-input');
    expect(searchBox).toBeTruthy();
    expect(searchBox.autofocus).toBeTrue();
  });

  it('should not get autofocus if false', async () => {
    await renderSearchInput([inputBinding('autofocus', () => false)]);
    const searchBox = screen.getByTestId('search-input');
    expect(searchBox.autofocus).toBeFalse();
  });

  it('should get autofocus if set', async () => {
    await renderSearchInput([inputBinding('autofocus', () => true)]);
    const searchBox = screen.getByTestId('search-input');
    expect(searchBox.autofocus).toBeTrue();
  });

  it('should trigger search when user type', async () => {
    await renderSearchInput([outputBinding('onSearch', onSearch)]);
    const user = userEvent.setup();
    const searchBox = screen.getByTestId('search-input');
    await user.type(searchBox, 'surval');
    expect(onSearch).toHaveBeenCalled();
  });

  it('should update the search store when user types', async () => {
    await renderSearchInput();
    const user = userEvent.setup();
    const searchBox = screen.getByTestId('search-input');
    const searchString = 'surval';

    // await user.type(searchBox, searchString);
    fireEvent.input(searchBox, { target: { value: searchString } });

    expect(mockStore.setFullTextQuery).toHaveBeenCalledWith(searchString);
  });

  it('should not trigger search when user type if searchOnInput=false', async () => {
    await renderSearchInput([
      inputBinding('searchOnInput', () => false),
      outputBinding('onSearch', onSearch),
    ]);
    const user = userEvent.setup();
    const searchBox = screen.getByTestId('search-input');
    await user.type(searchBox, 'surval');
    expect(onSearch).not.toHaveBeenCalled();
  });
});
