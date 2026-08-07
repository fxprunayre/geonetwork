import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppConfigurationPanelService {
  private readonly isOpenSignal = signal(false);

  readonly isOpen = this.isOpenSignal.asReadonly();

  open() {
    this.isOpenSignal.set(true);
  }

  close() {
    this.isOpenSignal.set(false);
  }

  toggle() {
    this.isOpenSignal.update((value) => !value);
  }
}
