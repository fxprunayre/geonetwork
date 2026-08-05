import { Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidTrash } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DeleteConfirmationDialog } from '../../../../shared/widgets/delete-confirmation-dialog/delete-confirmation-dialog';
import { AuthStore } from '../../../authentication/auth.store';
import { RecordFieldBase } from '../../../record';
import { AssociatedRecordsSummary } from '../../../record-associations/associated-records-summary/associated-records-summary';
import { RecordActionService } from '../../record-action.service';

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
        (confirmed)="deleteRecord()"
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
  private readonly recordActionService = inject(RecordActionService);
  private authStore = inject(AuthStore);

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

    this.displayConfirmation = false;
    this.recordActionService.deleteRecord(uuid).subscribe();
  }
}
