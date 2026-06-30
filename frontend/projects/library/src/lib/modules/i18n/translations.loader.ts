import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { mergeDeep, TranslateLoader } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface TranslationResource {
  prefix: string;
  suffix?: string;
  useHeader?: boolean;
  optional?: boolean;
}

// Modified loader to support Accept-Language header and optional files
export class TranslationsLoader implements TranslateLoader {
  private http: HttpClient;

  constructor(
    private _handler: HttpBackend,
    private _resourcesPrefix: (string | TranslationResource)[],
  ) {
    this.http = new HttpClient(this._handler);
  }

  public getTranslation(lang: string): Observable<Record<string, string>> {
    const requests = this._resourcesPrefix.map((resource) => {
      let path: string;
      let headers: HttpHeaders | undefined;

      if (typeof resource === 'string') {
        path = `${resource}${lang}.json`;
      } else {
        if (resource.useHeader) {
          path = `${resource.prefix}${resource.suffix ?? '.json'}`;
          headers = new HttpHeaders({ 'Accept-Language': lang });
        } else {
          path = `${resource.prefix}${lang}${resource.suffix ?? '.json'}`;
        }
      }

      return this.http.get(path, { headers }).pipe(
        catchError((error) => {
          if (typeof resource !== 'string' && !resource.optional) {
            console.group();
            console.error('Translation file error:', path);
            console.error(error);
            console.groupEnd();
          }
          return of({});
        }),
      );
    });

    return (forkJoin(requests) as Observable<Record<string, string>[]>).pipe(
      map(
        (responses) =>
          responses.reduce(
            (acc, curr) => mergeDeep(acc, curr),
            {} as Record<string, string>,
          ) as Record<string, string>,
      ),
    );
  }
}
