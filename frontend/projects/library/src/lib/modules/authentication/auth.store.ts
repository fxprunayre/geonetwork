import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MeResponse } from 'gn4-api-client';
import { pipe } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  error: any | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
  })),
  withMethods((store, authService = inject(AuthenticationService), router = inject(Router)) => ({
    loadUser: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          authService.getUserInfo().pipe(
            tapResponse({
              next: (user) => patchState(store, { user, isLoading: false, error: null }),
              error: (error) => patchState(store, { user: null, isLoading: false, error }),
            }),
          ),
        ),
      ),
    ),
    signIn: rxMethod<{ username: string; password: string; redirectUrl?: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ username, password, redirectUrl }) =>
          authService.signIn(username, password).pipe(
            tapResponse({
              next: (user) => {
                patchState(store, { user, isLoading: false, error: null });
                if (redirectUrl) {
                  router.navigateByUrl(redirectUrl);
                }
              },
              error: (error) => patchState(store, { isLoading: false, error }),
            }),
          ),
        ),
      ),
    ),
    signOut: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          authService.signOut().pipe(
            tapResponse({
              next: () => patchState(store, { user: null, isLoading: false, error: null }),
              error: (error) => patchState(store, { isLoading: false, error }),
            }),
          ),
        ),
      ),
    ),
  })),
);
