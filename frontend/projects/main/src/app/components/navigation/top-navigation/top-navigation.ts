import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faUser } from '@ng-icons/font-awesome/regular';
import { FormsModule } from '@angular/forms';
import { LanguageSwitcher } from 'gn-library';

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.html',
  styleUrl: './top-navigation.scss',
  standalone: true,
  viewProviders: [provideIcons({ faUser })],
  imports: [ButtonModule, StyleClassModule, RouterLink, NgIcon, FormsModule, LanguageSwitcher],
})
export class TopNavigation {
  logo = 'images/logo.svg';
}
