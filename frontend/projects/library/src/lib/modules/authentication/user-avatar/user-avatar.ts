import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';
import { AuthStore } from '../auth.store';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [AvatarModule, ButtonModule, CommonModule, PopoverModule, TranslatePipe],
  templateUrl: './user-avatar.html',
})
export class UserAvatarComponent {
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

  signOut() {
    this.store.signOut();
  }
}
