import { LocationChangeListener, LocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';

/**
 * Custom implementation of LocationStrategy that keeps navigation in memory.
 * This prevents the Angular Web Component from interfering with the host page's URL.
 * But it will not support browser navigation buttons (back/forward).
 */
@Injectable()
export class InMemoryLocationStrategy extends LocationStrategy {
  private _path = '';
  private _baseHref = '';

  override getState(): unknown {
    return null;
  }

  override path(_includeHash?: boolean): string {
    return this._path;
  }

  override prepareExternalUrl(internal: string): string {
    return this._baseHref + internal;
  }

  override pushState(state: any, title: string, url: string, queryParams: string): void {
    this._path = url + (queryParams ? '?' + queryParams : '');
  }

  override replaceState(state: any, title: string, url: string, queryParams: string): void {
    this._path = url + (queryParams ? '?' + queryParams : '');
  }

  override onPopState(_fn: LocationChangeListener): void {
    // No-op: no onPopState
  }

  override forward(): void {
    // No-op: no history to navigate
  }

  override back(): void {
    // No-op: no history to navigate
  }

  override getBaseHref(): string {
    return this._baseHref;
  }
}
