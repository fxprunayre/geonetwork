import { Component, Input, inject } from '@angular/core';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCopy } from '@ng-icons/font-awesome/solid';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-copy-input',
  standalone: true,
  imports: [Button, ButtonIcon, TranslatePipe, NgIcon, Toast, ButtonLabel],
  viewProviders: [provideIcons({ faSolidCopy })],
  templateUrl: './copy-input.html',
})
export class CopyInput {
  @Input({ required: true }) value!: string;
  @Input() layout: 'button' | 'buttonWithIcon' | 'icon' | 'text' = 'button';
  @Input() buttonClass = '';

  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  copyToClipboard() {
    navigator.clipboard.writeText(this.value);

    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('copy.title_success'),
      detail: this.translate.instant('copy.detail_success'),
      life: 1500,
    });
  }
}
