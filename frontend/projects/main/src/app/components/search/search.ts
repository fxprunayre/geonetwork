import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  ResultsView,
  SearchActiveFiltersButton,
  SearchBase,
  SearchInput,
  SearchWelcomeTextPipe,
} from 'gn-library';
import { Button, ButtonIcon } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Results } from '../results/results';
import { SearchFilters } from '../search-filters/search-filters';

export type FilterPanelLayout = 'drawer' | 'side' | 'top';

@Component({
  selector: 'app-search',
  imports: [
    SearchFilters,
    SearchInput,
    Results,
    ResultsView,
    Drawer,
    Button,
    NgIcon,
    ButtonIcon,
    FormsModule,
    TranslatePipe,
    SearchWelcomeTextPipe,
    OverlayBadgeModule,
    NgClass,
    SearchActiveFiltersButton,
  ],
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.scss',
  viewProviders: [provideIcons({ faSolidFilter, faSolidXmark })],
})
export class Search extends SearchBase {
  visible = false;
  filterPanelMode = signal<FilterPanelLayout>('side');

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  backgroundImageUrl = computed(() => this.appConfiguration().config?.backgroundImageUrl || '');

  resultsLayoutOptions = computed(
    () => this.appConfiguration().config?.apps.search?.resultsLayoutOptions || [],
  );

  get hasResults(): boolean {
    return this.search?.totalCount() > 0;
  }
}
