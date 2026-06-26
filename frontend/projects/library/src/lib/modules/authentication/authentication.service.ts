import { Injectable } from '@angular/core';
import { MeResponse } from 'gn4-api-client';
import { Observable } from 'rxjs';

export interface AuthenticationProvider {
  id: string;
  endpoint: string;
}

@Injectable()
export abstract class AuthenticationService {
  abstract signIn(username: string, password: string): Observable<MeResponse>;

  abstract signOut(): Observable<unknown>;

  abstract getUserInfo(): Observable<MeResponse>;

  abstract getAuthenticationProviders(): Observable<AuthenticationProvider[]>;
}
