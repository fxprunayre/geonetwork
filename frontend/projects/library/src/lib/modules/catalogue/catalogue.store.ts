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
import { SiteService } from 'gn4-api-client';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface CatalogueState {
  name: string;
  organization: string;
  siteId: string;
}

const initialState: CatalogueState = {
  name: '',
  organization: '',
  siteId: '',
};

export const CatalogueStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ siteId }) => ({
    logoUrl: computed(() => (siteId() ? `/images/logos/${siteId()}.png` : '')),
  })),
  withMethods((store, siteService = inject(SiteService), titleService = inject(Title)) => ({
    loadConfig: rxMethod<void>(
      pipe(
        switchMap(() =>
          siteService.getSiteOrPortalDescription('body').pipe(
            tapResponse({
              next: (response) => {
                const settings = response as any;
                const name = settings['system/site/name'] || 'GeoNetwork';
                const organization = settings['system/site/organization'] || '';
                const siteId = settings['system/site/siteId'] || '';

                patchState(store, { name, organization, siteId });

                const title = [name, organization].filter(Boolean).join(' - ');
                if (title) {
                  titleService.setTitle(title);
                }
              },
              error: console.error,
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.loadConfig();
    },
  }),
);
