import { Location } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidTrash } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RecordsService } from '../../../../../../gn4-api-client/src/public-api';
import { DeleteConfirmationDialog } from '../../../shared/widgets/delete-confirmation-dialog/delete-confirmation-dialog';
import { AuthStore } from '../../authentication/auth.store';
import { AssociatedRecordsSummary } from '../../record-associations/associated-records-summary/associated-records-summary';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-delete-button',
  template: `
    @if (canDelete()) {
      <p-button
        severity="danger"
        [title]="'record.action.deleteTitle' | translate"
        (onClick)="confirmDeletion()"
      >
        <ng-icon name="faSolidTrash" pButtonIcon></ng-icon>
        <span pButtonLabel>{{ 'delete' | translate }}</span>
      </p-button>

      <app-delete-confirmation-dialog
        [(visible)]="displayConfirmation"
        [title]="'record.action.deleteConfirmationTitle' | translate"
        [message]="'record.action.deleteConfirmationMessage' | translate"
        [confirmInputLabel]="'record.action.typeToConfirm' | translate: { word: confirmationWord }"
        [confirmWord]="confirmationWord"
        (onConfirm)="deleteRecord()"
      >
        <app-associated-records-summary [record]="record()" />
      </app-delete-confirmation-dialog>
    }
  `,
  standalone: true,
  imports: [
    ButtonModule,
    NgIcon,
    TranslatePipe,
    DeleteConfirmationDialog,
    AssociatedRecordsSummary,
  ],
  viewProviders: [
    provideIcons({
      faSolidTrash,
    }),
  ],
})
export class RecordDeleteButton extends RecordFieldBase {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private authStore = inject(AuthStore);
  private recordsService = inject(RecordsService);
  private messageService = inject(MessageService);
  private location = inject(Location);

  canDelete = computed(() => {
    return this.authStore.isAuthenticated() && this.record().info?.edit;
  });

  displayConfirmation = false;
  confirmationWord = 'DELETE';

  confirmDeletion() {
    this.displayConfirmation = true;
  }

  deleteRecord() {
    const uuid = this.record().uuid;
    if (!uuid) return;

    this.recordsService.deleteRecord(uuid).subscribe({
      next: () => {
        this.displayConfirmation = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('success'),
          detail: this.translate.instant('record.action.deleteSuccess'),
        });
        // Navigate away, e.g. to home or search
        this.displayConfirmation = false;
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
          detail: this.translate.instant('record.action.deleteError'),
        });
      },
    });
  }
}
