import { Component, computed, effect, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBookmark } from '@ng-icons/font-awesome/regular';
import { faSolidBookmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { UserselectionsService } from 'gn4-api-client';
import { ButtonModule } from 'primeng/button';
import { catchError, EMPTY, finalize, of } from 'rxjs';
import { AuthStore } from '../../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordFieldBase } from '../../record/record-field-base/record-field-base';

@Component({
  selector: 'app-bookmark',
  standalone: true,
  imports: [ButtonModule, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faBookmark,
      faSolidBookmark,
    }),
  ],
  template: `
    @if (isVisible()) {
      <p-button
        [text]="true"
        [disabled]="isSubmitting() || isStatusLoading()"
        [title]="buttonTitleKey() | translate"
        [styleClass]="buttonClass()"
        (onClick)="toggleBookmark()"
      >
        <ng-icon [name]="iconName()" pButtonIcon></ng-icon>
      </p-button>
    }
  `,
})
export class Bookmark extends RecordFieldBase {
  private readonly preferredListId = 0;
  private readonly userSelectionsService = inject(UserselectionsService);
  private readonly authStore = inject(AuthStore);

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  isSubmitting = signal(false);
  isStatusLoading = signal(false);
  isBookmarked = signal(false);

  isVisible = computed(() => {
    const appEnabled = this.appConfiguration().config?.apps?.userSelections?.enabled ?? true;
    return appEnabled && this.authStore.isAuthenticated();
  });

  buttonTitleKey = computed(() =>
    this.isBookmarked() ? 'record.action.unbookmarkTitle' : 'record.action.bookmarkTitle',
  );

  iconName = computed(() => (this.isBookmarked() ? 'faSolidBookmark' : 'faBookmark'));

  buttonClass = computed(() => {
    const baseClass = 'transition-colors';

    if (this.isBookmarked()) {
      return (
        baseClass +
        ' !text-primary-contrast hover:!bg-red-600 hover:!border-red-600 hover:!text-white'
      );
    } else {
      return (
        baseClass +
        ' !text-primary-contrast hover:!bg-primary hover:!border-primary hover:!text-white'
      );
    }

    return baseClass + ' !text-inherit !opacity-90 hover:!opacity-100';
  });

  constructor() {
    super();

    effect((onCleanup) => {
      const appEnabled = this.appConfiguration().config?.apps?.userSelections?.enabled ?? true;
      const userId = Number(this.authStore.user()?.id);
      const recordUuid = this.record().uuid;

      if (!appEnabled || !userId || !recordUuid) {
        this.isBookmarked.set(false);
        this.isStatusLoading.set(false);
        return;
      }

      this.isStatusLoading.set(true);
      const sub = this.userSelectionsService
        .getSelectionRecords(this.preferredListId, userId)
        .pipe(catchError(() => of([] as string[])))
        .subscribe((uuids) => {
          this.isBookmarked.set((uuids || []).includes(recordUuid));
          this.isStatusLoading.set(false);
        });

      onCleanup(() => sub.unsubscribe());
    });
  }

  toggleBookmark(): void {
    const userId = Number(this.authStore.user()?.id);
    const recordUuid = this.record().uuid;

    if (!userId || !recordUuid || this.isSubmitting() || this.isStatusLoading()) {
      return;
    }

    this.isSubmitting.set(true);
    const request$ = this.isBookmarked()
      ? this.userSelectionsService.deleteFromUserSelection(this.preferredListId, userId, [
          recordUuid,
        ])
      : this.userSelectionsService.addToUserSelection(this.preferredListId, userId, [recordUuid]);

    request$
      .pipe(
        catchError(() => EMPTY),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe(() => {
        this.isBookmarked.update((v) => !v);
      });
  }
}
