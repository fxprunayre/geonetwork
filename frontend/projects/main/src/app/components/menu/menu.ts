import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faCompass, faMap } from '@ng-icons/font-awesome/regular';
import {
  faSolidArrowRightFromBracket,
  faSolidArrowRightToBracket,
  faSolidBars,
  faSolidBookmark,
  faSolidEllipsisVertical,
  faSolidGear,
  faSolidHouse,
  faSolidLanguage,
  faSolidMagnifyingGlass,
  faSolidPaintRoller,
  faSolidPlus,
} from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import { MenuDesignTokens } from '@primeuix/themes/types/menu';
import {
  AuthStore,
  CatalogueLogo,
  DASHBOARD_ROUTE_PATH,
  Gn4UrlService,
  IconStyleService,
  MAP_ROUTE_PATH,
  RecordAddMenu,
  SEARCH_ROUTE_PATH,
  TranslationsService,
  UserAvatar,
  UserFullNamePipe,
} from 'gn-library';
import { MenuItem, MessageService, SharedModule } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { TextareaModule } from 'primeng/textarea';
import { Toast } from 'primeng/toast';

const ICONS = {
  faSolidHouse,
  faSolidBars,
  faSolidEllipsisVertical,
  faSolidPlus,
  faSolidGear,
  faSolidMagnifyingGlass,
  faSolidPaintRoller,
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
    CatalogueLogo,
    FormsModule,
    Menu,
    NgIcon,
    RecordAddMenu,
    RouterLink,
    RouterLinkActive,
    SharedModule,
    Toast,
    TextareaModule,
    UserAvatar,
    UserFullNamePipe,
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
  @ViewChild(RecordAddMenu) recordAddButton: RecordAddMenu | undefined;

  isExpandedOnHover = signal(false);

  readonly authStore = inject(AuthStore);
  styleService = inject(IconStyleService);
  translateService = inject(TranslateService);
  translationsService = inject(TranslationsService);
  gn4UrlService = inject(Gn4UrlService);
  router = inject(Router);
  messageService = inject(MessageService);

  elementRef = inject(ElementRef);

  DASHBOARD_ROUTE_PATH = DASHBOARD_ROUTE_PATH;

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
        title: this.isIconMode() ? this.translateService.instant('menu.home') : '',
        icon: 'faCompass',
        routerLink: '/',
        routerLinkActiveOptions: { exact: true },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.search'),
        title: this.isIconMode() ? this.translateService.instant('menu.search') : '',
        icon: 'faSolidMagnifyingGlass',
        routerLink: SEARCH_ROUTE_PATH,
        routerLinkActiveOptions: { exact: false },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.map'),
        title: this.isIconMode() ? this.translateService.instant('menu.map') : '',
        icon: 'faMap',
        routerLink: MAP_ROUTE_PATH,
        routerLinkActiveOptions: { exact: true },
        // TODO: External mapviewer?
        // command: () => {
        //   window.open(`https://sextant.ifremer.fr/geonetwork/srv/fre/catalog.search#/map`, 'map');
        // },
        ...this.itemConfig(),
      },
      {
        separator: true,
        styleClass: 'mb-10',
      },
      {
        label: this.translateService.instant('menu.signin'),
        title: this.isIconMode() ? this.translateService.instant('menu.signin') : '',
        visible: !this.isAuthenticated(),
        icon: 'faSolidArrowRightToBracket',
        command: () => {
          this.router.navigate(['/signin'], { queryParams: { redirectUrl: location.href } });
        },
        ...this.itemConfig(),
      },
      {
        label: this.translateService.instant('menu.signout'),
        title: this.isIconMode() ? this.translateService.instant('menu.signout') : '',
        visible: this.isAuthenticated(),
        icon: 'faSolidArrowRightFromBracket',
        command: () => {
          this.authStore.signOut();
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
      padding: '0px',
    },
    item: {
      padding: '12px 16px',
      borderRadius: '0',
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

  isIconMode = signal(true);

  isAuthenticated = this.authStore.isAuthenticated;

  user = this.authStore.user;

  userRole = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.profile || '';
  });

  currentLang = signal(this.translateService.getCurrentLang(), { equal: () => false });

  ngOnInit() {
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang.set(event.lang);
    });

    this.styleService.createIconsStyle(
      'menu-icon-style',
      this.items(),
      ICONS,
      this.elementRef.nativeElement.getRootNode(),
    );
  }

  toggleMenu() {
    this.isIconMode.update((v) => !v);
  }

  expandMenu() {
    if (!this.isExpandedOnHover()) return;
    this.isIconMode.set(false);
  }

  collapseMenu() {
    if (!this.isExpandedOnHover()) return;
    this.isIconMode.set(true);
  }
}
