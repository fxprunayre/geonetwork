import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { inputBinding, outputBinding, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { SearchStoreType } from '../search-store';
import { createMockSearchStore, provideMockSearchService } from '../search-store.mock.spec';
import { SearchInput } from './search-input';

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
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
      bindings,
    });
  };

  beforeEach(() => {
    onSearch.calls.reset();
  });

  const getInputElement = () => {
    const container = screen.getByTestId('search-input');
    return container.tagName.toLowerCase() === 'INPUT'
      ? container
      : container.querySelector('input')!;
  };

  it('should create with an input with focus in', async () => {
    await renderSearchInput();
    const searchBox = getInputElement();
    expect(searchBox).toBeTruthy();
    expect((searchBox as HTMLInputElement).autofocus).toBeTrue();
  });

  it('should not get autofocus if false', async () => {
    await renderSearchInput([inputBinding('autofocus', () => false)]);
    const searchBox = getInputElement();
    expect((searchBox as HTMLInputElement).autofocus).toBeFalse();
  });

  it('should get autofocus if set', async () => {
    await renderSearchInput([inputBinding('autofocus', () => true)]);
    const searchBox = getInputElement();
    expect((searchBox as HTMLInputElement).autofocus).toBeTrue();
  });

  it('should trigger search when user type', async () => {
    const result = await renderSearchInput([outputBinding('onSearch', onSearch)]);
    result.fixture.componentInstance.onModelChange('surval');
    expect(onSearch).toHaveBeenCalled();
  });

  it('should update the search store when user types', async () => {
    const result = await renderSearchInput();
    const searchString = 'surval';

    result.fixture.componentInstance.onModelChange(searchString);

    expect(mockStore.setFullTextQuery).toHaveBeenCalledWith(searchString);
  });

  it('should not trigger search when user type if searchOnInput=false', async () => {
    const result = await renderSearchInput([
      inputBinding('searchOnInput', () => false),
      outputBinding('onSearch', onSearch),
    ]);
    result.fixture.componentInstance.searchOnInputChange('surval');
    expect(onSearch).not.toHaveBeenCalled();
  });
});
