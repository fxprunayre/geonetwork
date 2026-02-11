import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../auth.store';
import { AvatarModule } from 'primeng/avatar';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, AvatarModule, PopoverModule, ButtonModule, TranslatePipe],
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
