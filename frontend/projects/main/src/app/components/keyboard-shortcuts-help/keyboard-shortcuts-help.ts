import { Component, effect, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';

@Component({
  selector: 'app-keyboard-shortcuts-help',
  imports: [Dialog],
  template: `
    <p-dialog
      [visible]="isVisible()"
      (visibleChange)="handleVisibilityChange($event)"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      header="Keyboard shortcuts"
    >
      <ul class="space-y-2">
        @for (shortcut of shortcuts(); track shortcut.key) {
          <li class="flex items-center justify-between gap-4">
            <span>{{ shortcut.description }}</span>
            <kbd class="rounded bg-surface-100 px-2 py-1 text-sm">{{ shortcut.key }}</kbd>
          </li>
        }
      </ul>
    </p-dialog>
  `,
})
export class KeyboardShortcutsHelpComponent {
  private readonly keyboardShortcuts = inject(KeyboardShortcutsService);

  readonly isVisible = signal(false);
  readonly shortcuts = signal(this.keyboardShortcuts.shortcuts);

  constructor() {
    effect(() => {
      this.isVisible.set(this.keyboardShortcuts.helpVisible());
    });
  }

  handleVisibilityChange(visible: boolean) {
    if (visible) {
      this.isVisible.set(true);
    } else {
      this.isVisible.set(false);
      this.keyboardShortcuts.closeHelp();
    }
  }
}
