import { render, screen } from '@testing-library/angular';
import { LoadingMask } from './loading-mask.component';
import { inputBinding } from '@angular/core';
import { provideMockTranslateService } from '../../translate.service.mock.spec';

describe('"Loading mask', () => {
  it('should show mask when loading', async () => {
    await render(LoadingMask, {
      providers: [provideMockTranslateService()],
      bindings: [inputBinding('loading', () => true)],
    });
    expect(screen.getByTestId('loading-mask')).toBeTruthy();
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('should hide mask when not loading', async () => {
    const { container } = await render(LoadingMask, {
      providers: [provideMockTranslateService()],
      bindings: [inputBinding('loading', () => false)],
    });
    expect(container.querySelector('div')).toBeNull();
  });
});
