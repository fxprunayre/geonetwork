import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faCompass } from '@ng-icons/font-awesome/regular';
import {
  faSolidBars,
  faSolidBookmark,
  faSolidCode,
  faSolidFile,
  faSolidGear,
  faSolidImage,
  faSolidLanguage,
  faSolidLock,
  faSolidMagnifyingGlass,
  faSolidMap,
  faSolidPaintRoller,
} from '@ng-icons/font-awesome/solid';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Apps } from '../../model/gnConfig';

@Component({
  selector: 'app-config-editor-sidebar',
  standalone: true,
  imports: [NgClass, Menu, NgIconComponent],
  viewProviders: [
    provideIcons({
      faCompass,
      faSolidMagnifyingGlass,
      faSolidMap,
      faSolidLanguage,
      faSolidLock,
      faSolidFile,
      faSolidGear,
      faSolidBars,
      faSolidImage,
      faSolidBookmark,
      faSolidPaintRoller,
      faSolidCode,
    }),
  ],
  template: `
    <p-menu [model]="menuItems" styleClass="w-full">
      <ng-template #item let-item let-options="options">
        <a
          pRipple
          class="flex items-center py-2 px-3 no-underline cursor-pointer rounded transition-colors text-surface-700 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800"
          [ngClass]="item.styleClass"
          tabindex="0"
          (click)="item.command?.()"
          (keydown.enter)="item.command?.()"
          (keydown.space)="item.command?.(); $event.preventDefault()"
        >
          @if (item.icon) {
            <ng-icon [name]="item.icon" class="mr-2"></ng-icon>
          }
          <span>{{ item.label }}</span>
        </a>
      </ng-template>
    </p-menu>
  `,
})
export class ConfigEditorSidebarComponent {
  @Input() appNames: (keyof Apps)[] = [];
  @Input() selectedTab = 'theme';
  @Output() selectedTabChange = new EventEmitter<string>();

  private readonly iconMap: Record<string, string> = {
    home: 'faCompass',
    search: 'faSolidMagnifyingGlass',
    map: 'faSolidMap',
    i18n: 'faSolidLanguage',
    authentication: 'faSolidLock',
    userSelections: 'faSolidBookmark',
    record: 'faSolidFile',
    menu: 'faSolidBars',
    banner: 'faSolidImage',
  };

  private readonly appLabelMap: Partial<Record<keyof Apps, string>> = {
    userSelections: 'Bookmark',
  };

  get menuItems(): MenuItem[] {
    return [
      {
        label: 'Apps',
        items: this.appNames.map((appName) => ({
          label: this.getAppDisplayLabel(appName),
          icon: this.iconMap[appName] || 'faSolidGear',
          command: () => this.selectedTabChange.emit(appName),
          styleClass:
            this.selectedTab === appName
              ? 'bg-primary-100/50 dark:bg-primary-900/50 font-bold'
              : '',
        })),
      },
      {
        label: 'Settings',
        items: [
          {
            label: 'Theme',
            icon: 'faSolidPaintRoller',
            command: () => this.selectedTabChange.emit('theme'),
            styleClass:
              this.selectedTab === 'theme'
                ? 'bg-primary-100/50 dark:bg-primary-900/50 font-bold'
                : '',
          },
          {
            label: 'Raw Configuration',
            icon: 'faSolidCode',
            command: () => this.selectedTabChange.emit('raw'),
            styleClass:
              this.selectedTab === 'raw'
                ? 'bg-primary-100/50 dark:bg-primary-900/50 font-bold'
                : '',
          },
        ],
      },
    ];
  }

  private getAppDisplayLabel(appName: keyof Apps): string {
    return this.appLabelMap[appName] || appName.charAt(0).toUpperCase() + appName.slice(1);
  }
}
