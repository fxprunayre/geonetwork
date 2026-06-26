import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { MeResponse, MeService } from 'gn4-api-client'; // Re-using type for compatibility for now
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { AuthenticationProvider, AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class GnAuthenticationService implements AuthenticationService {
  private http = inject(HttpClient);
  // private meService = inject(MeApiService);
  private meService = inject(MeService);
  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  signIn(username: string, password: string): Observable<MeResponse> {
    const body = new HttpParams().set('username', username).set('password', password);
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http
      .post(this.catalogueUrl() + '/api/user/signin', body, {
        headers,
        observe: 'response',
        responseType: 'text',
      })
      .pipe(
        // map((response) => {
        //    if (response.url && response.url.includes('error')) {
        //     throw new Error('Login failed');
        //   }
        //   return response;
        // }),
        switchMap(() => this.getUserInfo()),
        map((user) => {
          if (user?.username || user?.id) {
            return user;
          }
          throw new Error('Login failed');
        }),
      );
  }

  signOut(): Observable<unknown> {
    return from(
      fetch(this.catalogueUrl() + '/api/user/signout', {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual',
      }),
    ).pipe(
      map(() => null),
      catchError(() => of(null)),
    );
  }

  getUserInfo(): Observable<MeResponse> {
    return this.meService.getMe();
    // TODO GN5 does not provide all user info for now
    // Mapping GN5 user response to MeResponse if possible, or casting
    // return this.meService.user('body').pipe(
    //   switchMap((u) => {
    //     if (u instanceof Blob) {
    //       return from(u.text()).pipe(map((text) => JSON.parse(text) as MeResponse));
    //     }
    //     return of(u as unknown as MeResponse);
    //   }),
    // );
  }

  getAuthenticationProviders(): Observable<AuthenticationProvider[]> {
    // TODO: Implement GN5 providers check
    return of([
      {
        id: 'database',
        endpoint: '',
      },
    ]);
  }
}
