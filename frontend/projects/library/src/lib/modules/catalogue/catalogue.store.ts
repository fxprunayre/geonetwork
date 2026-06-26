import { computed, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { SiteService } from 'gn4-api-client';
import { MessageService } from 'primeng/api';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface CatalogueState {
  name: string;
  organization: string;
  siteId: string;
  isServerDown: boolean;
}

const initialState: CatalogueState = {
  name: '',
  organization: '',
  siteId: '',
  isServerDown: false,
};

export const CatalogueStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ siteId }) => ({
    logoUrl: computed(() => (siteId() ? `/images/logos/${siteId()}.png` : '')),
  })),
  withMethods(
    (
      store,
      siteService = inject(SiteService),
      titleService = inject(Title),
      messageService = inject(MessageService),
      translateService = inject(TranslateService),
    ) => ({
      loadConfig: rxMethod<void>(
        pipe(
          switchMap(() =>
            siteService.getSiteOrPortalDescription('body').pipe(
              tapResponse({
                next: (response) => {
                  const settings = response as Record<string, string>;
                  const name = settings['system/site/name'] || 'GeoNetwork';
                  const organization = settings['system/site/organization'] || '';
                  const siteId = settings['system/site/siteId'] || '';

                  patchState(store, { name, organization, siteId, isServerDown: false });

                  const title = [name, organization].filter(Boolean).join(' - ');
                  if (title) {
                    titleService.setTitle(title);
                  }
                },
                error: (err) => {
                  console.error(err);
                  patchState(store, { isServerDown: true });
                  messageService.add({
                    severity: 'error',
                    summary: translateService.instant('shared.error') || 'Error',
                    detail:
                      translateService.instant('shared.serverDown') ||
                      'The server seems to be down or unreachable.',
                    life: 10000,
                  });
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
  withHooks({
    onInit(store) {
      store.loadConfig();
    },
  }),
);
