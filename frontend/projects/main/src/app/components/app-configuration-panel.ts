import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidFileImport,
  faSolidGear,
  faSolidPaintRoller,
  faSolidPlus,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  AuthStore,
  ConfigEditorComponent,
  LanguageSwitcher,
  TranslationsService,
} from 'gn-library';
import { Drawer } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';

import { NgTemplateOutlet } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { KeyboardShortcutsService } from '../services/keyboard-shortcuts.service';
import { AppConfigurationPanelService } from './app-configuration-panel.service';

const ICONS = {
  faSolidPlus,
  faSolidGear,
  faSolidPaintRoller,
  faSolidArrowRightFromBracket,
  faSolidFileImport,
};

@Component({
  selector: 'app-configuration-panel',
  imports: [
    MenubarModule,
    TranslatePipe,
    Drawer,
    LanguageSwitcher,
    ConfigEditorComponent,
    TabsModule,
    NgTemplateOutlet,
  ],
  viewProviders: [provideIcons(ICONS)],
  template: `
    <ng-template #appConfiguration>
      <p-tabs value="preferences">
        <p-tablist>
          <p-tab value="preferences">{{ 'user.boardMenu.preferences' | translate }}</p-tab>
          @if (userRole() === 'Administrator') {
            <p-tab value="configuration">{{ 'user.boardMenu.configuration' | translate }}</p-tab>
          }
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="preferences">
            <app-language-switcher />
          </p-tabpanel>
          @if (userRole() === 'Administrator') {
            <p-tabpanel value="configuration">
              <app-config-editor />
            </p-tabpanel>
          }
        </p-tabpanels>
      </p-tabs>
    </ng-template>

    <p-drawer
      [visible]="isConfigurationVisible()"
      (visibleChange)="handleVisibilityChange($event)"
      [header]="'menu.settings' | translate"
      position="right"
      modal="false"
      styleClass="!w-3/5"
      [pt]="{ header: 'header-row' }"
    >
      <ng-container [ngTemplateOutlet]="appConfiguration"></ng-container>
    </p-drawer>
  `,
})
export class AppConfigurationPanel implements OnInit {
  readonly translateService = inject(TranslateService);
  readonly translationsService = inject(TranslationsService);
  readonly authStore = inject(AuthStore);
  readonly panelService = inject(AppConfigurationPanelService);
  readonly keyboardShortcuts = inject(KeyboardShortcutsService);

  isAuthenticated = this.authStore.isAuthenticated;

  user = this.authStore.user;

  userRole = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.profile || '';
  });

  isConfigurationVisible = this.panelService.isOpen;

  appConfig = inject(APPLICATION_CONFIGURATION);

  currentLang = signal(this.translateService.getCurrentLang(), { equal: () => false });

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang.set(event.lang);
    });
  }

  handleVisibilityChange(visible: boolean) {
    if (visible) {
      this.panelService.open();
    } else {
      this.panelService.close();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (this.keyboardShortcuts.handleKeydown(event)) {
      return;
    }
  }
}
