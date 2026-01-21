import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faCompass, faMap } from '@ng-icons/font-awesome/regular';
import {
  faSolidArrowRightFromBracket,
  faSolidArrowRightToBracket,
  faSolidBars,
  faSolidEllipsisVertical,
  faSolidGear,
  faSolidBookmark,
  faSolidHouse,
  faSolidLanguage,
  faSolidMagnifyingGlass,
  faSolidPlus,
} from '@ng-icons/font-awesome/solid';
import {
  APPLICATION_CONFIGURATION,
  IconStyleService,
  LanguageSwitcher,
  SEARCH_ROUTE_PATH,
  ThemeDesigner,
} from 'gn-library';
import { MenuItem, MessageService, SharedModule } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { Fieldset } from 'primeng/fieldset';
import { IftaLabel } from 'primeng/iftalabel';
import { Menu } from 'primeng/menu';
import { TextareaModule } from 'primeng/textarea';
import { TieredMenu } from 'primeng/tieredmenu';
import AppTheme from '../../app.theme';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuDesignTokens } from '@primeuix/themes/types/menu';
import { Toast } from 'primeng/toast';

const ICONS = {
  faSolidHouse,
  faSolidBars,
  faSolidEllipsisVertical,
  faSolidPlus,
  faSolidGear,
  faSolidMagnifyingGlass,
  faMap,
  faSolidBookmark,
  faCompass,
  faSolidLanguage,
  faSolidArrowRightFromBracket,
  faSolidArrowRightToBracket,
};

@Component({
  selector: 'app-menu',
  imports: [
    Menu,
    TieredMenu,
    RouterLink,
    LanguageSwitcher,
    TranslatePipe,
    ThemeDesigner,
    NgIcon,
    SharedModule,
    Drawer,
    Toast,
    Fieldset,
    IftaLabel,
    FormsModule,
    TextareaModule,
  ],
  providers: [MessageService],
  standalone: true,
  viewProviders: [provideIcons(ICONS)],
  templateUrl: './menu.html',
  styles: [
    `
      :host ::ng-deep .p-menu-item-link-active {
        border-right: 5px solid var(--p-primary-100) !important;
      }
    `,
  ],
})
export class MenuComponent implements OnInit {
  logo = 'images/logo.svg';

  styleService = inject(IconStyleService);
  translateService = inject(TranslateService);
  router = inject(Router);
  messageService = inject(MessageService);

  elementRef = inject(ElementRef);
  appConfig = inject(APPLICATION_CONFIGURATION);
  appConfigJson = computed(() => JSON.stringify(this.appConfig(), null, 2));

  updateConfig(event: string) {
    this.appConfig.set(JSON.parse(event));
  }

  itemConfig = computed<MenuItem>(() => {
    return {
      iconClass: 'md:text-2xl',
    };
  });

  items = computed<MenuItem[] | undefined>(() => {
    this.currentLang();
    return [
      {
        label: this.translateService.instant('menu.home'),
        title: this.translateService.instant('menu.home'),
        icon: 'faCompass',
        routerLink: '/',
        routerLinkActiveOptions: { exact: true },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.search'),
        title: this.translateService.instant('menu.search'),
        icon: 'faSolidMagnifyingGlass',
        routerLink: SEARCH_ROUTE_PATH,
        routerLinkActiveOptions: { exact: false },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.map'),
        title: this.translateService.instant('menu.map'),
        icon: 'faMap',
        command: () => {
          window.open(`https://sextant.ifremer.fr/geonetwork/srv/fre/catalog.search#/map`, 'map');
        },
        ...this.itemConfig(),
      },
      {
        separator: true,
        styleClass: 'mb-10',
      },
      {
        label: this.translateService.instant('menu.signin'),
        title: this.translateService.instant('menu.signin'),
        visible: !this.isAuthenticated(),
        icon: 'faSolidArrowRightToBracket',
        command: () => {
          this.isAuthenticated.update((v) => !v);
        },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.addrecord'),
        title: this.translateService.instant('menu.addrecord'),
        icon: 'faSolidPlus',
        visible: this.isAuthenticated(),
        ...this.itemConfig(),
        command: (event: any) => {
          this.addRecordMenu?.toggle(event.originalEvent);
        },
      },
      {
        label: this.translateService.instant('menu.my.record'),
        title: this.translateService.instant('menu.my.record'),
        icon: 'faSolidHouse',
        visible: this.isAuthenticated(),
        command: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'See my record',
            detail: 'Not implemented yet',
            life: 3000,
          });
        },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.my.favorites'),
        title: this.translateService.instant('menu.my.favorites'),
        icon: 'faSolidBookmark',
        visible: this.isAuthenticated(),
        command: () => {
          this.messageService.add({
            severity: 'warn',
            summary: 'See my favorite',
            detail: 'Not implemented yet',
            life: 3000,
          });
        },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.signout'),
        title: this.translateService.instant('menu.signout'),
        visible: this.isAuthenticated(),
        icon: 'faSolidArrowRightFromBracket',
        command: () => {
          this.isAuthenticated.update((v) => !v);
        },
        ...this.itemConfig(),
      },
      {
        separator: true,
      },
      {
        label: this.translateService.instant('menu.settings'),
        title: this.translateService.instant('menu.settings'),
        icon: 'faSolidGear',
        command: () => {
          this.isConfigurationVisible.update((v) => !v);
        },
        ...this.itemConfig(),
      },
    ];
  });

  dt: MenuDesignTokens = {
    root: {
      borderRadius: '0',
    },
    list: {
      gap: '6px',
      padding: '16px',
    },
    colorScheme: {
      light: {
        root: {
          background: 'var(--p-primary-500)',
          borderColor: 'var(--p-primary-500)',
          color: 'var(--p-surface-50)',
        },
        item: {
          color: 'var(--p-surface-50)',
          icon: { color: 'var(--p-surface-50)' },
        },
      },
    },
  };

  @ViewChild('addRecordMenu') addRecordMenu: TieredMenu | undefined;

  addRecordItems = computed<MenuItem[]>(() => {
    this.currentLang();
    return [
      {
        label: this.translateService.instant('New dataset'),
        icon: 'faSolidFile',
        command: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Add record',
            detail: 'From template',
          });
        },
      },
      {
        label: this.translateService.instant('New Software'),
        icon: 'faSolidCloudArrowUp',
        command: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Add record',
            detail: 'From software template',
          });
        },
      },
      {
        label: this.translateService.instant('Import from file or URL'),
        icon: 'faSolidArrowRightToBracket',
        command: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Add record',
            detail: 'Import from file or URL',
          });
        },
      },
    ];
  });

  isIconMode = signal(true);

  isConfigurationVisible = signal(false);

  isAuthenticated = signal(false);

  currentLang = signal(this.translateService.getCurrentLang(), { equal: () => false });

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang.set(event.lang);
    });

    const usedIcons = new Set<string>();
    const collectIcons = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.icon) {
          usedIcons.add(item.icon);
        }
        if (item.items) {
          collectIcons(item.items);
        }
      });
    };

    const menuItems = this.items();
    if (menuItems) {
      collectIcons(menuItems);
    }

    this.styleService.ensureIconsStyle(
      'menu-icon-style',
      Array.from(usedIcons)
        .map((icon) => ({
          className: icon,
          svgContent: ICONS[icon as keyof typeof ICONS],
        }))
        .filter((def) => def.svgContent),
      this.elementRef.nativeElement.getRootNode(),
    );
  }

  toggleMenu() {
    this.isIconMode.update((v) => !v);
  }

  expandMenu() {
    this.isIconMode.set(false);
  }

  collapseMenu() {
    this.isIconMode.set(true);
  }

  theme = AppTheme;
}
