import { NgClass } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCompress, faSolidExpand } from '@ng-icons/font-awesome/solid';
import { Button, ButtonIcon } from 'primeng/button';

@Component({
  selector: 'app-full-screen-panel',
  imports: [Button, ButtonIcon, NgClass, NgIcon],
  viewProviders: [provideIcons({ faSolidExpand, faSolidCompress })],
  template: `
    <div
      class="transition-all duration-300"
      [ngClass]="isFullScreen() ? fullScreenContainerClass() : normalContainerClass()"
    >
      <div class="flex justify-end mb-2">
        <p-button (click)="toggleFullScreen()" [rounded]="true" [text]="true" size="small">
          @if (isFullScreen()) {
            <ng-icon name="faSolidCompress" pButtonIcon />
          } @else {
            <ng-icon name="faSolidExpand" pButtonIcon />
          }
        </p-button>
      </div>

      <div [ngClass]="[contentClass(), isFullScreen() ? fullScreenContentClass() : '']">
        <ng-content />
      </div>
    </div>
  `,
})
export class FullScreenPanel {
  normalContainerClass = input('relative');
  fullScreenContainerClass = input(
    'fixed inset-0 z-100 h-screen w-screen bg-white p-4 flex flex-col',
  );
  contentClass = input('');
  fullScreenContentClass = input('flex-1 min-h-0');

  isFullScreen = signal(false);

  constructor() {
    effect(() => {
      const isFullScreen = this.isFullScreen();
      if (isFullScreen) {
        document.documentElement.style.overflow = 'hidden';
      } else {
        document.documentElement.style.overflow = '';
      }
    });
  }

  toggleFullScreen() {
    this.isFullScreen.update((state) => !state);
    // Trigger resize after transition so embedded viewers can redraw correctly.
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
  }
}
