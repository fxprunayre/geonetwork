import {Component, signal} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faUser } from '@ng-icons/font-awesome/regular';
import { faSolidBars, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { FormsModule } from '@angular/forms';
import { LanguageSwitcher } from 'gn-library';

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.html',
  styleUrl: './top-navigation.scss',
  standalone: true,
  viewProviders: [provideIcons({ faUser, faSolidBars, faSolidXmark })],
  imports: [ButtonModule, StyleClassModule, RouterLink, NgIcon, FormsModule, LanguageSwitcher],
})
export class TopNavigation {
  logo = 'images/logo.svg';

  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }
}
