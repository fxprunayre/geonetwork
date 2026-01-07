import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faCompass, faMap } from '@ng-icons/font-awesome/regular';
import {
  faSolidArrowRightFromBracket,
  faSolidArrowRightToBracket,
  faSolidBars,
  faSolidEllipsisVertical,
  faSolidGear,
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
import { MenuItem, SharedModule } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { Fieldset } from 'primeng/fieldset';
import { IftaLabel } from 'primeng/iftalabel';
import { Menu } from 'primeng/menu';
import { TextareaModule } from 'primeng/textarea';
import AppTheme from '../../app.theme';
import { TranslateService } from '@ngx-translate/core';

const ICONS = {
  faSolidHouse,
  faSolidBars,
  faSolidEllipsisVertical,
  faSolidPlus,
  faSolidGear,
  faSolidMagnifyingGlass,
  faMap,
  faCompass,
  faSolidLanguage,
  faSolidArrowRightFromBracket,
  faSolidArrowRightToBracket,
};

@Component({
  selector: 'app-navigation',
  imports: [
    Menu,
    RouterLink,
    LanguageSwitcher,
    ThemeDesigner,
    NgIcon,
    SharedModule,
    Drawer,
    Fieldset,
    IftaLabel,
    FormsModule,
    TextareaModule,
  ],
  standalone: true,
  viewProviders: [provideIcons(ICONS)],
  templateUrl: './navigation.html',
})
export class Navigation implements OnInit {
  logo = 'images/logo.svg';

  styleService = inject(IconStyleService);
  translateService = inject(TranslateService);
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
        icon: 'faCompass',
        routerLink: '/',
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.search'),
        icon: 'faSolidMagnifyingGlass',
        routerLink: SEARCH_ROUTE_PATH,
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.map'),
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
        visible: !this.isAuthenticated(),
        icon: 'faSolidArrowRightToBracket',
        command: () => {
          this.isAuthenticated.update((v) => !v);
        },
      },
      {
        label: this.translateService.instant('menu.addrecord'),
        icon: 'faSolidPlus',
        styleClass: 'font-bold',
        visible: this.isAuthenticated(),
      },
      {
        label: this.translateService.instant('menu.signout'),
        visible: this.isAuthenticated(),
        icon: 'faSolidArrowRightFromBracket',
        command: () => {
          this.isAuthenticated.update((v) => !v);
        },
      },
      {
        separator: true,
      },
      {
        label: this.translateService.instant('menu.settings'),
        icon: 'faSolidGear',
        command: () => {
          this.isConfigurationVisible.update((v) => !v);
        },
      },
      // {
      //   label: 'You',
      //   items: [
      //     {
      //       label: 'Favorites',
      //     },
      //     {
      //       label: 'Messages',
      //     },
      //     {
      //       label: 'Logout',
      //     }
      //   ]
      // },
      // {
      //   separator: true
      // }
    ];
  });

  dt = {
    border: {
      radius: 0,
    },
    colorScheme: {
      light: {
        root: {
          background: 'var(--p-primary-500)',
          borderColor: 'var(--p-primary-500)',
          color: 'var(--p-surface-50)',
          item: { color: 'var(--p-surface-50)' },
          submenu: { label: { color: 'var(--p-surface-50)' } },
        },
      },
    },
  };

  isIconMode = signal(true);

  isConfigurationVisible = signal(false);

  isAuthenticated = signal(false);

  currentLang = signal(this.translateService.getCurrentLang());

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
      'navigation-icon-style',
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

  theme = AppTheme;
}
