import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faCompass, faMap } from '@ng-icons/font-awesome/regular';
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
import { APPLICATION_CONFIGURATION, LanguageSwitcher, ThemeDesigner } from 'gn-library';
import { MenuItem, SharedModule } from 'primeng/api';
import { Drawer } from 'primeng/drawer';
import { Fieldset } from 'primeng/fieldset';
import { IftaLabel } from 'primeng/iftalabel';
import { Menu } from 'primeng/menu';
import { TextareaModule } from 'primeng/textarea';
import AppTheme from '../../app.theme';

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
    IftaLabel,
    FormsModule,
    TextareaModule,
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
      faCompass,
      faSolidLanguage,
      faSolidArrowRightFromBracket,
      faSolidArrowRightToBracket,
    }),
  ],
  templateUrl: './navigation.html',
})
export class Navigation implements OnInit {
  logo = 'images/logo.svg';

  appConfig = inject(APPLICATION_CONFIGURATION);
  appConfigJson = computed(() => JSON.stringify(this.appConfig(), null, 2));

  updateConfig(event: string) {
    this.appConfig.set(JSON.parse(event));
  }

  items = computed<MenuItem[] | undefined>(() => {
    return [
      {
        icon: 'faSolidBars',
        label: '',
        command: () => {
          this.toggleMenu();
        },
      },
      {
        separator: true,
      },
      {
        label: 'Home',
        icon: 'faCompass',
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
