import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { provideIcons } from '@ng-icons/core';
import { faSolidLock } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { RelatedItemType } from 'gn-api-client';
import { catchError, map, of, throwError } from 'rxjs';
import { AlertPanel } from '../../../shared/widgets/alert-panel/alert-panel';
import { SearchService } from '../../search/search-service';
import { RecordViewSkeleton } from '../record-view-skeleton/record-view-skeleton';
import { RecordViewContent } from './record-view-content';

@Component({
  selector: 'app-record-view',
  standalone: true,
  imports: [RecordViewContent, RecordViewSkeleton, TranslatePipe, AlertPanel],
  viewProviders: [provideIcons({ faSolidLock })],
  template: `
    @if (recordResource.isLoading()) {
      <app-record-view-skeleton />
    } @else if (recordStatus()) {
      <div class="p-8 pb-32 h-[450px]">
        <app-alert-panel
          severity="error"
          icon="faSolidLock"
          [title]="recordStatus()! | translate: { uuid: uuid() }"
          [hint]="'shared.signInOrDoAnotherSearch' | translate"
        >
        </app-alert-panel>
      </div>
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
  private readonly recordRelatedTypes = [
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
  ] as const;

  private readonly recordRelatedTypesWithVersions = [
    ...this.recordRelatedTypes,
    RelatedItemType.Versions,
  ] as const;

  uuid = input<string | null>();
  tab = input<string>('about');
  layout = input<'fieldset' | 'panel' | ''>('');
  backButtonTplRef = input<TemplateRef<unknown>>();
  headerTplRef = input<TemplateRef<unknown>>();

  onRecordClick = output<string>();

  searchService = inject(SearchService);
  private readonly titleService = inject(Title);

  recordResource = rxResource({
    params: () => ({ uuid: this.uuid() }),
    stream: ({ params }) => {
      const uuid = params.uuid;
      if (!uuid) return of(undefined);
      return this.searchService
        .getById(uuid, [...this.recordRelatedTypesWithVersions])
        .pipe(
          // Retry without "versions" when connected to older GeoNetwork APIs.
          catchError((error: unknown) => {
            const isUnsupportedVersionsError =
              error instanceof HttpErrorResponse && error.status === 400;
            if (isUnsupportedVersionsError) {
              return this.searchService.getById(uuid, [...this.recordRelatedTypes]);
            }
            if (
              error instanceof HttpErrorResponse &&
              (error.status === 404 || error.status === 403)
            ) {
              return of(null);
            }
            return throwError(() => error);
          }),
        )
        .pipe(
          map((result) => {
            return result;
          }),
        );
    },
  });

  record = computed(() => {
    const data = this.recordResource.value();
    return data === null ? undefined : data;
  });

  recordStatus = computed(() => {
    const error = this.recordResource.error() as Error;
    if (error) {
      return error.message ?? 'record.view.notFoundOrNotShared';
    }
    const data = this.recordResource.value();
    if (data === null) {
      return 'record.view.notFoundOrNotShared';
    }
    return undefined;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    const initialTitle = this.titleService.getTitle();

    effect(() => {
      const rec = this.record();
      if (rec?.resourceTitleObject?.['default']) {
        this.titleService.setTitle(rec.resourceTitleObject['default']);
      }
    });

    destroyRef.onDestroy(() => {
      this.titleService.setTitle(initialTitle);
    });
  }
}
