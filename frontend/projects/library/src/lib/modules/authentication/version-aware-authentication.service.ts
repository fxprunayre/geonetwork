import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { MeResponse } from 'gn4-api-client';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { AuthenticationProvider, AuthenticationService } from './authentication.service';
import { GnAuthenticationService } from './gn-authentication.service';
import { Gn4AuthenticationService } from './gn4-authentication.service';

@Injectable({
  providedIn: 'root',
})
export class VersionAwareAuthenticationService implements AuthenticationService {
  private http = inject(HttpClient);
  private gnAuthenticationService = inject(GnAuthenticationService);
  private gn4AuthenticationService = inject(Gn4AuthenticationService);
  private appConfiguration = inject(APPLICATION_CONFIGURATION);

  private catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  private activeService$ = this.detectActiveService().pipe(shareReplay(1));

  signIn(username: string, password: string): Observable<MeResponse> {
    return this.activeService$.pipe(switchMap((service) => service.signIn(username, password)));
  }

  signOut(): Observable<any> {
    return this.activeService$.pipe(switchMap((service) => service.signOut()));
  }

  getUserInfo(): Observable<MeResponse> {
    return this.activeService$.pipe(switchMap((service) => service.getUserInfo()));
  }

  getAuthenticationProviders(): Observable<AuthenticationProvider[]> {
    return this.activeService$.pipe(switchMap((service) => service.getAuthenticationProviders()));
  }

  private detectActiveService(): Observable<AuthenticationService> {
    const signInEndpoint = this.catalogueUrl() + '/api/user/auth-providers';

    return this.http.get(signInEndpoint, { observe: 'response' }).pipe(
      map(() => this.gnAuthenticationService),
      catchError((error: HttpErrorResponse) => {
        // GN5 endpoint exists but may reject OPTIONS depending on server config.
        if ([0, 401, 403, 405, 415].includes(error.status)) {
          return of(this.gnAuthenticationService);
        }

        return of(this.gn4AuthenticationService);
      }),
    );
  }
}
