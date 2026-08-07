import { Component, computed, ElementRef, inject, OnInit, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidFileImport,
  faSolidGear,
  faSolidPaintRoller,
  faSolidPlus,
} from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  AuthStore,
  Gn4UrlService,
  IconStyleService,
  RecordActionService,
  TranslationsService,
} from 'gn-library';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AppConfigurationPanelService } from '../app-configuration-panel.service';

const ICONS = {
  faSolidPlus,
  faSolidGear,
  faSolidPaintRoller,
  faSolidArrowRightFromBracket,
  faSolidFileImport,
};

@Component({
  selector: 'app-user-board-menu',
  imports: [MenubarModule],
  viewProviders: [provideIcons(ICONS)],
  template: `
    <p-menubar
      [model]="items()"
      (click)="$event.stopPropagation()"
      [pt]="{
        rootList: { class: '!min-w-42 !left-auto !right-0' },
      }"
    >
      <ng-template #start>
        <!-- <app-user-avatar /> -->
      </ng-template>
    </p-menubar>
  `,
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
          this.panelService.open();
        },
      },
    ];
  });

  translateService = inject(TranslateService);
  translationsService = inject(TranslationsService);
  styleService = inject(IconStyleService);

  readonly authStore = inject(AuthStore);
  readonly panelService = inject(AppConfigurationPanelService);

  gn4UrlService = inject(Gn4UrlService);
  recordAddAction = inject(RecordActionService);

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
}
