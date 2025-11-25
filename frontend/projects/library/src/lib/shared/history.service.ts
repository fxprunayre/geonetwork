import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private router = inject(Router);
  private history: string[] = [];

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.history.push(event.urlAfterRedirects);
      });
  }

  // Use this method when using this.location.go
  public addUrlToHistory(url: string): void {
    this.history.push(url);
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public goBackToLastMatching(
    routePath: string,
    fallbackUrl?: string | undefined,
  ): Promise<boolean> {
    for (let i = this.history.length - 2; i >= 0; i--) {
      const url = this.history[i];

      if (url.startsWith(routePath)) {
        return this.router.navigateByUrl(url);
      }
    }

    return this.router.navigateByUrl(fallbackUrl || '/');
  }
}
