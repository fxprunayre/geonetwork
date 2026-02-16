import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightFromBracket,
  faSolidBookmark,
  faSolidCircleUser,
  faSolidGear,
  faSolidPenToSquare,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { PopoverModule } from 'primeng/popover';
import { AuthStore } from '../auth.store';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [
    AvatarModule,
    ButtonModule,
    CommonModule,
    PopoverModule,
    TranslatePipe,
    Drawer,
    NgIcon,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,
  ],
  viewProviders: [
    provideIcons({
      faSolidArrowRightFromBracket,
      faSolidPenToSquare,
      faSolidCircleUser,
      faSolidBookmark,
      faSolidGear,
    }),
  ],
  templateUrl: './user-avatar.html',
})
export class UserAvatarComponent {
  drawer = input(true);

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

  readonly store = inject(AuthStore);

  user = this.store.user;

  isAuthenticated = this.store.isAuthenticated;

  initials = computed(() => {
    const u = this.user();
    if (!u) return '';
    if (u.name && u.surname) {
      return `${u.name.charAt(0)}${u.surname.charAt(0)}`.toUpperCase();
    }
    return (u.username || '').substring(0, 2).toUpperCase();
  });

  visible: boolean = false;

  profileClass = computed(() => {
    const profile = this.user()?.profile;
    switch (profile) {
      case 'Administrator':
        return 'ring-orange-500';
      case 'UserAdmin':
        return 'ring-grey-500';
      case 'Reviewer':
        return 'ring-purple-500';
      case 'Editor':
        return 'ring-green-500';
      case 'RegisteredUser':
        return 'ring-sky-500';
      default:
        return 'ring-transparent';
    }
  });

  yourProfile() {
    throw new Error('Method not implemented.');
  }

  yourWork() {
    throw new Error('Method not implemented.');
  }

  yourBookmark() {
    throw new Error('Method not implemented.');
  }

  yourSettings() {
    throw new Error('Method not implemented.');
  }

  signOut() {
    this.store.signOut();
  }
}
