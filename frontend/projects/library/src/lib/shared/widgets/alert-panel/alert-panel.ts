import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidCircleExclamation,
  faSolidPlugCircleExclamation,
  faSolidTriangleExclamation,
} from '@ng-icons/font-awesome/solid';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-alert-panel',
  standalone: true,
  imports: [NgIcon, Message],
  providers: [
    provideIcons({
      faSolidTriangleExclamation,
      faSolidPlugCircleExclamation,
      faSolidCircleExclamation,
    }),
  ],
  template: `
    <p-message severity="error" class="w-full flex flex-row items-center p-6 gap-4 m-6">
      <div class="text-9xl mb-2">
        <ng-icon [name]="icon()" />
      </div>
      <div class="text-xl font-medium">
        {{ title() }}
      </div>
      @if (hint()) {
        <div class="text-base">
          {{ hint() }}
        </div>
      }
    </p-message>
  `,
})
export class AlertPanel {
  severity = input<'error' | 'warning' | 'info'>('error');
  icon = input<string>('faSolidTriangleExclamation');
  title = input<string>('');
  hint = input<string>('');
}
