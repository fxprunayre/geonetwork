import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpXsrfTokenExtractor,
} from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { MeResponse, MeService, SiteService } from 'gn4-api-client';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { AuthenticationProvider, AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class Gn4AuthenticationService implements AuthenticationService {
  private http = inject(HttpClient);
  private siteService = inject(SiteService);
  private meService = inject(MeService);
  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  private tokenExtractor = inject(HttpXsrfTokenExtractor);

  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  private ensureAuthenticatedUser(userInfo: MeResponse): MeResponse {
    const username = userInfo.username?.trim();
    if (!username) {
      throw new Error('Login failed');
    }
    return userInfo;
  }

  signIn(username: string, password: string): Observable<MeResponse> {
    const token = this.tokenExtractor.getToken() || '';
    const body = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('_csrf', token);
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http
      .post(this.catalogueUrl() + '/signin', body, {
        headers,
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((response) => {
          // If no CSRF token or no CORS error, the server return redirect with failure in URL
          if (response.url && response.url.includes('failure=true')) {
            throw new Error('Login failed');
          }
          return response;
        }),
        switchMap(() => this.getUserInfo()),
        map((userInfo) => this.ensureAuthenticatedUser(userInfo)),
        catchError((error: unknown) => {
          const isCorsOrNetworkError = error instanceof HttpErrorResponse && error.status === 0;

          if (isCorsOrNetworkError) {
            return this.getUserInfo().pipe(
              map((userInfo) => this.ensureAuthenticatedUser(userInfo)),
              catchError(() => throwError(() => new Error('Login failed'))),
            );
          }

          return throwError(() => error);
        }),
      );
  }

  signOut(): Observable<any> {
    const redirectUrl = document.baseURI || window.location.origin;
    window.location.href =
      this.catalogueUrl() + '/signout?redirectUrl=' + encodeURIComponent(redirectUrl);
    return new Observable(() => {});
  }

  getUserInfo(): Observable<MeResponse> {
    return this.meService.getMe();
  }

  private getRedirectUrlFromLocation(): string {
    // With HashLocationStrategy, query params are stored after '#', eg '#/signin?redirectUrl=...'.
    const hash = window.location.hash || '';
    const hashQueryIndex = hash.indexOf('?');
    if (hashQueryIndex >= 0) {
      const hashParams = new URLSearchParams(hash.substring(hashQueryIndex + 1));
      const hashRedirectUrl = hashParams.get('redirectUrl');
      if (hashRedirectUrl) {
        return hashRedirectUrl;
      }
    }

    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('redirectUrl') || window.location.href;
  }

  getAuthenticationProviders(): Observable<AuthenticationProvider[]> {
    let redirectUrl = this.getRedirectUrlFromLocation();
    if (redirectUrl.startsWith('/')) {
      redirectUrl = window.location.origin + redirectUrl;
    }

    return this.siteService.isCasEnabled().pipe(
      map((isCasEnabled) => {
        if (isCasEnabled) {
          return [
            {
              id: 'cas',
              endpoint:
                this.catalogueUrl() + '/casRedirect?service=' + encodeURIComponent(redirectUrl),
            },
          ];
        }
        // TODO: GN4 does not advertised OAuth2 providers, so we can't distinguish them from database provider for now
        // Hardcode for sextant:
        // * Current production is using CAS (see above)
        // * Test env use OAuth2 (Go to signin endpoint which redirect accordingly)
        // * Local dev env use database provider
        if (this.catalogueUrl().includes('ifremer.fr')) {
          return [
            {
              id: 'OpenID Connect',
              endpoint:
                this.catalogueUrl() + '/signin?redirectUrl=' + encodeURIComponent(redirectUrl),
            },
          ];
        }
        return [
          {
            id: 'database',
            endpoint: '',
          },
        ];
      }),
    );
  }
}
