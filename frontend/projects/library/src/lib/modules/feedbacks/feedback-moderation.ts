import { Component, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCheck,
  faSolidTrash,
  faSolidTriangleExclamation,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserFeedbackDTO } from 'gn4-api-client';
import { Button } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-feedback-moderation',
  imports: [MenubarModule, NgIcon, TranslatePipe, Button, Message],
  templateUrl: './feedback-moderation.html',
  viewProviders: [provideIcons({ faSolidTriangleExclamation, faSolidCheck, faSolidTrash })],
})
export class FeedbackModeration {
  private readonly translate = inject(TranslateService);

  comment = input.required<UserFeedbackDTO>();
  canEditCurrentRecord = input(false);
  approveInProgress = input(false);
  removeInProgress = input(false);

  currentLang = signal(this.translate.getCurrentLang());

  approve = output<string>();
  remove = output<string>();

  onApprove() {
    const uuid = this.comment().uuid;
    if (uuid) {
      this.approve.emit(uuid);
    }
  }

  onRemove() {
    const uuid = this.comment().uuid;
    if (uuid) {
      this.remove.emit(uuid);
    }
  }
}
