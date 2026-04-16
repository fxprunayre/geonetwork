import { Component, computed, ElementRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  Gn4UrlService,
  IconStyleService,
  LanguageSwitcher,
  ThemeDesigner,
  TranslationsService,
  UserAvatar,
} from 'gn-library';
import { MenuItem } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { Fieldset } from 'primeng/fieldset';
import { IftaLabel } from 'primeng/iftalabel';
import { MenubarModule } from 'primeng/menubar';
import AppTheme from '../../app.theme';

const ICONS = {
  faSolidPlus,
  faSolidGear,
  faSolidPaintRoller,
  faSolidArrowRightFromBracket,
  faSolidFileImport,
};

@Component({
  selector: 'app-user-board-menu',
  imports: [
    MenubarModule,
    TranslatePipe,
    Drawer,
    Fieldset,
    LanguageSwitcher,
    ThemeDesigner,
    IftaLabel,
    FormsModule,
    UserAvatar,
  ],
  viewProviders: [provideIcons(ICONS)],
  template: ` <p-menubar [model]="items()">
      <ng-template #start>
        <!-- <app-user-avatar /> -->
      </ng-template>
    </p-menubar>

    <p-drawer
      [(visible)]="isConfigurationVisible"
      [header]="'menu.settings' | translate"
      position="right"
      [pt]="{ header: 'header-row' }"
    >
      <p-fieldset legend="Language">
        <app-language-switcher />
      </p-fieldset>

      <p-fieldset legend="Theme">
        <app-theme-designer [theme]="theme" />
      </p-fieldset>

      <p-fieldset legend="Config">
        <p-iftalabel>
          <textarea
            pTextarea
            id="description"
            [ngModel]="appConfigJson()"
            (ngModelChange)="updateConfig($event)"
            rows="10"
            style="resize: none"
          ></textarea>
          <label for="description">Configuration</label>
        </p-iftalabel>
      </p-fieldset>
    </p-drawer>`,
})
export class UserBoardMenu implements OnInit {
  items = computed<MenuItem[] | undefined>(() => {
    this.currentLang();
    return [
      {
        label: this.translateService.instant('record.action.addRecord.label'),
        icon: 'faSolidPlus',
        visible: this.isAuthenticated(),
        command: () => {
          window.open(this.gn4UrlService.getEditorUrl('create'), '_blank');
        },
      },
      {
        label: this.translateService.instant('record.action.importRecord'),
        icon: 'faSolidFileImport',
        visible: this.isAuthenticated(),
        command: () => {
          window.open(this.gn4UrlService.getEditorUrl('import'), '_blank');
        },
      },
      {
        label: this.translateService.instant('admin.goto'),
        icon: 'faSolidGear',
        visible: this.isAuthenticated() && this.userRole() === 'Administrator',
        command: () => {
          window.open(this.gn4UrlService.getAdminConsoleUrl(), 'adminConsole');
        },
      },
      {
        label: this.translateService.instant('menu.settings'),
        visible: this.isAuthenticated(),
        icon: 'faSolidPaintRoller',
        command: () => {
          this.isConfigurationVisible.update((v) => !v);
        },
      },
    ];
  });

  translateService = inject(TranslateService);
  translationsService = inject(TranslationsService);
  styleService = inject(IconStyleService);

  readonly authStore = inject(AuthStore);

  gn4UrlService = inject(Gn4UrlService);

  elementRef = inject(ElementRef);

  isAuthenticated = this.authStore.isAuthenticated;

  user = this.authStore.user;

  userRole = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.profile || '';
  });

  isConfigurationVisible = signal(false);

  theme = AppTheme;

  appConfig = inject(APPLICATION_CONFIGURATION);
  appConfigJson = computed(() => JSON.stringify(this.appConfig(), null, 2));

  updateConfig(event: string) {
    this.appConfig.set(JSON.parse(event));
  }

  currentLang = signal(this.translateService.getCurrentLang(), { equal: () => false });

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang.set(event.lang);
    });

    this.styleService.createIconsStyle(
      'editor-menu-icon-style',
      this.items(),
      ICONS,
      this.elementRef.nativeElement.getRootNode(),
    );
  }

  toggleConfiguration() {
    //this.isConfigurationVisible.update((v) => !v);
  }
}
