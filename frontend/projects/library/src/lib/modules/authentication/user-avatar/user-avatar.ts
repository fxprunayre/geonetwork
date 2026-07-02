import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidCircleUser,
  faSolidGear,
} from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { TieredMenu } from 'primeng/tieredmenu';
import { IconStyleService } from '../../../shared/icon-style-service';
import { AuthStore } from '../auth.store';
import { InitialsPipe } from '../pipes/initials.pipe';
import { UserFullNamePipe } from '../pipes/user-full-name.pipe';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [
    AvatarModule,
    ButtonModule,
    CommonModule,
    PopoverModule,
    TieredMenu,
    UserFullNamePipe,
    InitialsPipe,
  ],
  viewProviders: [
    provideIcons({
      faSolidArrowRightFromBracket,
      faSolidCircleUser,
      faSolidGear,
    }),
  ],
  templateUrl: './user-avatar.html',
})
export class UserAvatar implements OnInit {
  @ViewChild('menu') menu: Menu | undefined;

  withLabel = input(false);
  withMenu = input(false);

  toggle(event: Event) {
    if (this.withMenu() && this.menu) {
      this.menu.toggle(event);
    }
  }

  dt = {
    colorScheme: {
      light: {
        root: { background: '#ffffff', color: 'var(--p-primary-500)' },
      },
    },
  };

  pt = {
    root: 'ring-3',
  };

  private readonly elementRef = inject(ElementRef);
  readonly styleService = inject(IconStyleService);
  readonly authStore = inject(AuthStore);
  private translateService = inject(TranslateService);

  user = this.authStore.user;

  isAuthenticated = this.authStore.isAuthenticated;

  userRole = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.profile || '';
  });

  profileClass = computed(() => {
    const profile = this.user()?.profile;
    switch (profile) {
      case 'Administrator':
        return 'ring-profile-administrator';
      case 'UserAdmin':
        return 'ring-profile-useradmin';
      case 'Reviewer':
        return 'ring-profile-reviewer';
      case 'Editor':
        return 'ring-profile-editor';
      case 'RegisteredUser':
        return 'ring-profile-registereduser';
      default:
        return 'ring-transparent';
    }
  });

  menuItems: MenuItem[] = [
    {
      label: this.translateService.instant('user.profile'),
      title: this.translateService.instant('user.profile'),
      icon: 'faSolidCircleUser',
      command: () => {
        // Navigate to profile page
      },
    },
    {
      label: this.translateService.instant('user.settings'),
      title: this.translateService.instant('user.settings'),
      icon: 'faSolidGear',
      command: () => {
        // Navigate to settings page
      },
    },
    {
      separator: true,
    },
    {
      label: this.translateService.instant('menu.signout'),
      title: this.translateService.instant('menu.signout'),
      visible: this.isAuthenticated(),
      icon: 'faSolidArrowRightFromBracket',
      command: () => {
        this.authStore.signOut();
      },
    },
  ];

  ngOnInit() {
    this.styleService.createIconsStyle(
      'user-avatar-icon-style',
      this.menuItems,
      {
        faSolidArrowRightFromBracket,
        faSolidCircleUser,
        faSolidGear,
      },
      this.elementRef.nativeElement.getRootNode(),
    );
  }
}
