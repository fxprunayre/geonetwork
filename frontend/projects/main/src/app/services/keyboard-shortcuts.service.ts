import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthStore,
  MAP_ROUTE_PATH,
  SEARCH_ROUTE_PATH,
  SearchService,
  SIGNIN_ROUTE_PATH,
} from 'gn-library';
import { AppConfigurationPanelService } from '../components/app-configuration-panel.service';

type SearchPaginationStore = {
  previous?: () => void;
  next?: () => void;
};

export interface KeyboardShortcutDefinition {
  key: string;
  description: string;
  action: () => void;
  when?: () => boolean;
}

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  helpVisible = signal(false);

  private readonly router = inject(Router);
  private readonly panelService = inject(AppConfigurationPanelService);
  private readonly authStore = inject(AuthStore);
  private readonly isAuthenticated = this.authStore.isAuthenticated;
  private readonly searchService = inject(SearchService);

  readonly shortcuts: KeyboardShortcutDefinition[] = [
    {
      key: 'c',
      description: 'Open configuration panel',
      action: () => this.panelService.toggle(),
    },
    {
      key: 'b',
      description: 'Go to home',
      action: () => this.router.navigate(['/']),
    },
    {
      key: 's',
      description: 'Go to search',
      action: () => this.router.navigate([SEARCH_ROUTE_PATH]),
    },
    {
      key: 'arrowleft',
      description: 'Go to previous page',
      action: () => this.getSearchStoreForShortcuts()?.previous?.(),
      when: () => this.isSearchRoute(),
    },
    {
      key: 'arrowright',
      description: 'Go to next page',
      action: () => this.getSearchStoreForShortcuts()?.next?.(),
      when: () => this.isSearchRoute(),
    },
    {
      key: 'm',
      description: 'Go to map',
      action: () => this.router.navigate([MAP_ROUTE_PATH]),
    },
    {
      key: 'l',
      description: 'Sign in or sign out',
      action: () =>
        this.isAuthenticated()
          ? this.router.navigate([SIGNIN_ROUTE_PATH])
          : this.router.navigate([SIGNIN_ROUTE_PATH]),
    },
    {
      key: 'h',
      description: 'Show keyboard shortcuts',
      action: () => this.helpVisible.set(this.helpVisible() ? false : true),
    },
  ];

  handleKeydown(event: KeyboardEvent, options?: { skipIfEditable?: boolean }) {
    const skipIfEditable = options?.skipIfEditable ?? true;
    const target = event.composedPath()[0] as HTMLElement | null;
    const isEditableContext = skipIfEditable && this.isEditableTarget(target);

    if (isEditableContext) {
      return false;
    }

    const normalizedKey = event.key.toLowerCase();
    const shortcut = this.shortcuts.find((item) => item.key === normalizedKey);

    if (!shortcut) {
      return false;
    }

    if (shortcut.when && !shortcut.when()) {
      return false;
    }

    event.preventDefault();
    shortcut.action();
    return true;
  }

  openHelp() {
    this.helpVisible.set(true);
  }

  closeHelp() {
    this.helpVisible.set(false);
  }

  private isEditableTarget(element: HTMLElement | null): boolean {
    const current: HTMLElement | null = element;

    if (
      current &&
      (current.tagName === 'INPUT' ||
        current.tagName === 'TEXTAREA' ||
        current.tagName === 'SELECT' ||
        current.isContentEditable)
    ) {
      return true;
    }
    return false;
  }

  private isSearchRoute(): boolean {
    return this.router.url.startsWith(SEARCH_ROUTE_PATH);
  }

  private getSearchStoreForShortcuts(): SearchPaginationStore | undefined {
    const registeredStores = this.searchService.store as Record<string, SearchPaginationStore>;

    if (registeredStores['main']) {
      return registeredStores['main'];
    }

    return Object.values(registeredStores)[0];
  }
}
