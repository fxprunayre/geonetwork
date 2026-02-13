import { Component, computed, inject, input, output, TemplateRef } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { RelatedItemType } from 'gn-api-client';
import { Message } from 'primeng/message';
import { map, of } from 'rxjs';
import { SearchService } from '../../search/search-service';
import { RecordViewSkeleton } from '../record-view-skeleton/record-view-skeleton';
import { RecordViewContent } from './record-view-content';

@Component({
  selector: 'app-record-view',
  standalone: true,
  imports: [Message, RecordViewContent, RecordViewSkeleton, TranslatePipe],
  template: `
    @if (recordResource.isLoading()) {
      <app-record-view-skeleton />
    } @else if (recordStatus()) {
      <p-message severity="error">{{ recordStatus() | translate }}</p-message>
    } @else {
      <app-record-view-content
        [record]="record()"
        [tab]="tab()"
        [layout]="layout()"
        [backButtonTplRef]="backButtonTplRef()"
        [headerTplRef]="headerTplRef()"
        (onRecordClick)="onRecordClick.emit($event)"
      />
    }
  `,
})
export class RecordView {
  uuid = input<string | null>();
  tab = input<string>('about');
  layout = input<'fieldset' | 'panel' | ''>('');
  backButtonTplRef = input<TemplateRef<unknown>>();
  headerTplRef = input<TemplateRef<unknown>>();

  onRecordClick = output<string>();

  searchService = inject(SearchService);

  recordResource = rxResource({
    params: () => ({ uuid: this.uuid() }),
    stream: ({ params }) => {
      const uuid = params.uuid;
      if (!uuid) return of(undefined);
      return this.searchService
        .getById(uuid, [
          RelatedItemType.Parent,
          RelatedItemType.Children,
          RelatedItemType.Services,
          RelatedItemType.Sources,
          RelatedItemType.Hassources,
          RelatedItemType.BrothersAndSisters,
          RelatedItemType.Datasets,
          RelatedItemType.Siblings,
          RelatedItemType.Fcats,
          RelatedItemType.Hasfeaturecats,
          RelatedItemType.Associated,
        ])
        .pipe(
          map((result) => {
            if (result == null) {
              throw new Error('record.view.notFoundOrNotShared');
            }
            return result;
          }),
        );
    },
  });

  record = computed(() => this.recordResource.value());
  recordStatus = computed(
    () =>
      (this.recordResource.error() as Error)?.message ??
      (this.recordResource.error() ? 'record.view.notFoundOrNotShared' : undefined),
  );
}
