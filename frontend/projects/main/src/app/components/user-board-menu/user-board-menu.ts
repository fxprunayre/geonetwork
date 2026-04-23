import { Component, computed, ElementRef, inject, OnInit, signal } from '@angular/core';
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
  Gn4UrlService,
  IconStyleService,
  LanguageSwitcher,
  RecordAddActionService,
  TranslationsService,
} from 'gn-library';
import { MenuItem } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';

import { TabsModule } from 'primeng/tabs';

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
    LanguageSwitcher,
    ConfigEditorComponent,
    TabsModule,
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
      styleClass="!w-3/4"
      [pt]="{ header: 'header-row' }"
    >
      <p-tabs value="preferences">
        <p-tablist>
          <p-tab value="preferences">User preferences</p-tab>
          @if (userRole() === 'Administrator') {
            <p-tab value="configuration">App configuration</p-tab>
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
    </p-drawer>`,
})
export class UserBoardMenu implements OnInit {
  items = computed<MenuItem[] | undefined>(() => {
    this.currentLang();
    const templateCount = this.recordAddAction.templateCount();
    const hasTemplates = this.recordAddAction.hasTemplates();
    const addRecordTitle = hasTemplates
      ? this.translateService.instant('record.action.addRecord.xTemplateAvailable', {
          count: templateCount,
        })
      : this.translateService.instant('record.action.addRecord.noTemplates');

    return [
      {
        label: this.translateService.instant('record.action.addRecord.label'),
        icon: 'faSolidPlus',
        title: addRecordTitle,
        tooltip: addRecordTitle,
        tooltipPosition: 'bottom',
        disabled: !hasTemplates,
        visible: this.isAuthenticated(),
        command: () => {
          this.recordAddAction.openCreateRecord('_blank');
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
  recordAddAction = inject(RecordAddActionService);

  elementRef = inject(ElementRef);

  isAuthenticated = this.authStore.isAuthenticated;

  user = this.authStore.user;

  userRole = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.profile || '';
  });

  isConfigurationVisible = signal(false);

  appConfig = inject(APPLICATION_CONFIGURATION);

  currentLang = signal(this.translateService.getCurrentLang(), { equal: () => false });

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang.set(event.lang);
    });

    this.recordAddAction.refreshTemplateCount();

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
