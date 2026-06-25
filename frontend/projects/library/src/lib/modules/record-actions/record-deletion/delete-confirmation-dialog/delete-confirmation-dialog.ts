import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCheck, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [ButtonModule, DialogModule, FormsModule, InputTextModule, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidCheck,
      faSolidXmark,
    }),
  ],
  template: `
    <p-dialog [(visible)]="visible" [modal]="true" [header]="title()" (onHide)="reset()">
      <div class="flex flex-col gap-4">
        <p>{{ message() }}</p>
        <div class="flex flex-col gap-2">
          <label for="confirmationWord">{{ confirmInputLabel() }}</label>
          <input
            pInputText
            id="confirmationWord"
            [(ngModel)]="userConfirmationWord"
            [placeholder]="confirmWord()"
            class="w-full"
            autocomplete="off"
          />
        </div>
      </div>
      <div class="flex flex-col gap-4 mt-4">
        <ng-content />
      </div>

      <ng-template pTemplate="footer">
        <p-button (onClick)="close()">
          <ng-icon name="faSolidXmark" pButtonIcon></ng-icon>
          <span pButtonLabel>{{ cancelButtonLabel() || ('cancel' | translate) }}</span>
        </p-button>
        <p-button
          severity="danger"
          (onClick)="confirm()"
          [disabled]="userConfirmationWord !== confirmWord()"
        >
          <ng-icon name="faSolidCheck" pButtonIcon></ng-icon>
          <span pButtonLabel>{{ confirmButtonLabel() || ('delete' | translate) }}</span>
        </p-button>
      </ng-template>
    </p-dialog>
  `,
})
export class DeleteConfirmationDialog {
  visible = model.required<boolean>();

  title = input.required<string>();
  message = input.required<string>();
  confirmInputLabel = input.required<string>();
  confirmWord = input<string>('DELETE');

  confirmButtonLabel = input<string>();
  cancelButtonLabel = input<string>();

  confirmed = output<void>();

  userConfirmationWord = '';

  confirm() {
    if (this.userConfirmationWord === this.confirmWord()) {
      this.confirmed.emit();
      this.close();
    }
  }

  close() {
    this.visible.set(false);
    this.reset();
  }

  reset() {
    this.userConfirmationWord = '';
  }
}
