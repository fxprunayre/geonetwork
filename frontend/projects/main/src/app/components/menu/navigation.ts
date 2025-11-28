import { Component, computed, OnInit, signal } from '@angular/core';
import { MenuItem, SharedModule } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { provideIcons, NgIcon } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidArrowRightToBracket,
  faSolidBars,
  faSolidGear,
  faSolidHouse,
  faSolidLanguage,
  faSolidMagnifyingGlass,
  faSolidPlus,
} from '@ng-icons/font-awesome/solid';
import { faMap } from '@ng-icons/font-awesome/regular';
import { LanguageSwitcher, ThemeDesigner } from 'gn-library';
import AppTheme from '../../app.theme';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { Button, ButtonIcon } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Drawer } from 'primeng/drawer';
import { Fieldset } from 'primeng/fieldset';

// https://github.com/primefaces/primeng/blob/master/packages/primeng/src/menu/menu.ts
@Component({
  selector: 'app-navigation',
  imports: [
    Menu,
    RouterLink,
    RouterLinkActive,
    LanguageSwitcher,
    ThemeDesigner,
    NgIcon,
    NgTemplateOutlet,
    SharedModule,
    Drawer,
    Fieldset,
  ],
  standalone: true,
  viewProviders: [
    provideIcons({
      faSolidHouse,
      faSolidBars,
      faSolidPlus,
      faSolidGear,
      faSolidMagnifyingGlass,
      faMap,
      faSolidLanguage,
      faSolidArrowRightFromBracket,
      faSolidArrowRightToBracket,
    }),
  ],
  templateUrl: './navigation.html',
})
export class Navigation implements OnInit {
  logo = 'images/logo.svg';

  items = computed<MenuItem[] | undefined>(() => {
    return [
      {
        icon: 'faSolidBars',
        label: 'Menu',
        command: () => {
          this.toggleMenu();
        },
      },
      {
        separator: true,
      },
      {
        label: 'Home',
        icon: 'faSolidHouse',
        routerLink: '/',
      },
      {
        label: 'Search',
        icon: 'faSolidMagnifyingGlass',
        routerLink: '/search',
      },
      {
        label: 'Map',
        icon: 'faMap',
        command: () => {
          window.open(`https://sextant.ifremer.fr/geonetwork/srv/fre/catalog.search#/map`, 'map');
        },
      },
      {
        separator: true,
        styleClass: 'mb-10',
      },
      {
        label: 'Sign in',
        visible: !this.isAuthenticated(),
        icon: 'faSolidArrowRightToBracket',
        command: () => {
          this.isAuthenticated.update((v) => !v);
        },
      },
      {
        label: 'Add',
        icon: 'faSolidPlus',
        styleClass: 'font-bold',
        visible: this.isAuthenticated(),
      },
      {
        label: 'Sign out',
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
        label: 'Configure',
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

  ngOnInit() {}

  toggleMenu() {
    this.isIconMode.update((v) => !v);
    console.log(this.isIconMode());
  }

  theme = AppTheme;
}
