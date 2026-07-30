import { Injectable, signal, untracked } from '@angular/core';
import { IndexRecord } from 'gn-api-client';

interface ZoomToRecordRequest {
  recordId: string;
  requestId: number;
}

@Injectable({
  providedIn: 'root',
})
export class SearchMapOverlayService {
  private readonly pageResultsByScope = signal<Record<string, IndexRecord[]>>({});
  private readonly hoveredRecordByScope = signal<Record<string, string | null>>({});
  private readonly zoomToRecordRequestByScope = signal<Record<string, ZoomToRecordRequest | null>>(
    {},
  );

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

  requestZoomToRecord(scope: string, recordId: string) {
    const current = untracked(() => this.zoomToRecordRequestByScope());
    this.zoomToRecordRequestByScope.set({
      ...current,
      [scope]: {
        recordId,
        requestId: Date.now(),
      },
    });
  }

  getPageResults(scope: string): IndexRecord[] {
    return this.pageResultsByScope()[scope] || [];
  }

  getHoveredRecordId(scope: string): string | null {
    return this.hoveredRecordByScope()[scope] || null;
  }

  getZoomToRecordRequest(scope: string): ZoomToRecordRequest | null {
    return this.zoomToRecordRequestByScope()[scope] || null;
  }

  getPageResultsState() {
    return this.pageResultsByScope;
  }

  getHoveredRecordState() {
    return this.hoveredRecordByScope;
  }

  getZoomToRecordRequestState() {
    return this.zoomToRecordRequestByScope;
  }
}
