import { Injectable, signal, untracked } from '@angular/core';
import { IndexRecord } from 'gn-api-client';

@Injectable({
  providedIn: 'root',
})
export class SearchMapOverlayService {
  private readonly pageResultsByScope = signal<Record<string, IndexRecord[]>>({});
  private readonly hoveredRecordByScope = signal<Record<string, string | null>>({});

  setPageResults(scope: string, results: IndexRecord[]) {
    const current = untracked(() => this.pageResultsByScope());
    this.pageResultsByScope.set({
      ...current,
      [scope]: results,
    });
  }

  setHoveredRecordId(scope: string, recordId: string | null) {
    const current = untracked(() => this.hoveredRecordByScope());
    this.hoveredRecordByScope.set({
      ...current,
      [scope]: recordId,
    });
  }

  getPageResults(scope: string): IndexRecord[] {
    return this.pageResultsByScope()[scope] || [];
  }

  getHoveredRecordId(scope: string): string | null {
    return this.hoveredRecordByScope()[scope] || null;
  }

  getPageResultsState() {
    return this.pageResultsByScope;
  }

  getHoveredRecordState() {
    return this.hoveredRecordByScope;
  }
}
