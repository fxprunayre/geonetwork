import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MeApiService } from 'gn-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { AuthenticationService, AuthenticationProvider } from './authentication.service';
import { MeResponse } from 'gn4-api-client'; // Re-using type for compatibility for now

@Injectable({
  providedIn: 'root',
})
export class GnAuthenticationService implements AuthenticationService {
  private http = inject(HttpClient);
  private meService = inject(MeApiService);
  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  signIn(username: string, password: string): Observable<MeResponse> {
    // TODO: Implement GN5 sign in
    throw new Error('Method not implemented.');
  }

  signOut(): Observable<any> {
    return this.http.post(this.catalogueUrl() + '/signout', {});
  }

  getUserInfo(): Observable<MeResponse> {
    // Mapping GN5 user response to MeResponse if possible, or casting
    return this.meService.user().pipe(map((u) => u as unknown as MeResponse));
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
