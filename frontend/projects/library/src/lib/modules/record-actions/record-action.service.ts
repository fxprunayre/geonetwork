import { Location } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RecordsService } from 'gn4-api-client';
import { MessageService } from 'primeng/api';
import { Observable, tap } from 'rxjs';
import { Gn4UrlService } from '../config/gn4-url.service';
import { SearchService } from '../search/search-service';
import { initialState } from '../search/search-store';

@Injectable({
  providedIn: 'root',
})
export class RecordActionService {
  private readonly recordsService = inject(RecordsService);
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly searchService = inject(SearchService);
  private readonly gn4UrlService = inject(Gn4UrlService);

  readonly templateCount = signal(0);
  readonly hasTemplates = computed(() => this.templateCount() > 0);

  private hasLoaded = false;

  constructor() {
    this.refreshTemplateCount();
  }

  refreshTemplateCount() {
    if (this.hasLoaded) {
      return;
    }

    this.searchService
      .search({
        ...initialState,
        filter: [],
        filters: { isTemplate: { field: 'isTemplate', values: ['y'] } },
        pageSize: 0,
      })
      .subscribe((results) => {
        this.templateCount.set(results.totalCount);
        this.hasLoaded = true;
      });
  }

  getCreateRecordUrl() {
    return this.gn4UrlService.getEditorUrl('create');
  }

  openCreateRecord(target = '_blank') {
    if (!this.hasTemplates()) {
      return;
    }

    window.open(this.getCreateRecordUrl(), target);
  }

  deleteRecord(uuid: string): Observable<any> {
    return this.recordsService.deleteRecord(uuid).pipe(
      tap({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('success'),
            detail: this.translate.instant('record.action.delete.deleteSuccess'),
          });
          if (window.history.length > 1) {
            this.location.back();
          } else {
            this.router.navigate(['/search']);
          }
        },
        error: (err) => {
          console.error('Failed to delete record', err);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('error'),
            detail: this.translate.instant('record.action.delete.deleteError'),
          });
        },
      }),
    );
  }
}
