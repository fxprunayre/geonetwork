import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { MeResponse, MeService, SiteService } from 'gn4-api-client';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  signIn(username: string, password: string): Observable<MeResponse> {
    const body = new HttpParams().set('username', username).set('password', password);

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http
      .post(this.catalogueUrl() + '/signin', body, {
        headers,
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        map((response) => {
          if (response.url && response.url.includes('failure=true')) {
            throw new Error('Login failed');
          }
          return response;
        }),
        switchMap(() => this.getUserInfo()),
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

  getAuthenticationProviders(): Observable<AuthenticationProvider[]> {
    const params = new URLSearchParams(window.location.search);
    let redirectUrl = params.get('redirectUrl') || window.location.href;
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
