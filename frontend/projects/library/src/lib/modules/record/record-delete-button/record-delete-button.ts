import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidTrash, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RecordsService } from '../../../../../../gn4-api-client/src/public-api';
import { AuthStore } from '../../authentication/auth.store';
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
        <span pButtonLabel>{{ 'record.action.delete' | translate }}</span>
      </p-button>

      <p-dialog
        [(visible)]="displayConfirmation"
        [modal]="true"
        [header]="'record.action.deleteConfirmationTitle' | translate"
        [style]="{ width: '400px' }"
      >
        <div class="flex flex-col gap-4">
          <p>{{ 'record.action.deleteConfirmationMessage' | translate }}</p>
          <div class="flex flex-col gap-2">
            <label for="confirmationWord">{{
              'record.action.typeToConfirm' | translate: { word: confirmationWord }
            }}</label>
            <input
              pInputText
              id="confirmationWord"
              [(ngModel)]="userConfirmationWord"
              [placeholder]="confirmationWord"
              class="w-full"
            />
          </div>
        </div>
        <ng-template pTemplate="footer">
          <p-button (onClick)="displayConfirmation = false">
            <ng-icon name="faSolidXmark" pButtonIcon></ng-icon>
            <span pButtonLabel>{{ 'record.action.cancel' | translate }}</span>
          </p-button>
          <p-button
            severity="danger"
            (onClick)="deleteRecord()"
            [disabled]="userConfirmationWord !== confirmationWord"
          >
            <ng-icon name="faSolidCheck" pButtonIcon></ng-icon>
            <span pButtonLabel>{{ 'record.action.delete' | translate }}</span>
          </p-button>
        </ng-template>
      </p-dialog>
    }
  `,
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    NgIcon,
    TranslatePipe,
  ],
  providers: [ConfirmationService],
  viewProviders: [
    provideIcons({
      faSolidCheck,
      faSolidTrash,
      faSolidXmark,
    }),
  ],
})
export class RecordDeleteButton extends RecordFieldBase {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private authStore = inject(AuthStore);
  private recordsService = inject(RecordsService);
  private messageService = inject(MessageService);

  canDelete = computed(() => {
    return this.authStore.isAuthenticated() && this.record().info?.edit;
  });

  displayConfirmation = false;
  confirmationWord = 'DELETE';
  userConfirmationWord = '';

  confirmDeletion() {
    this.userConfirmationWord = '';
    this.displayConfirmation = true;
  }

  deleteRecord() {
    if (this.userConfirmationWord !== this.confirmationWord) {
      return;
    }

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
        this.router.navigate(['/search']);
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
