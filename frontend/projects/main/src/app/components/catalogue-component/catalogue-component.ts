import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  ResultViewComponent,
  SearchAppLayout,
  SearchBase,
  SearchInput,
  SearchWelcomeTextPipe,
  SearchActiveFiltersButton,
} from 'gn-library';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ResultHeader } from '../result-header/result-header';
import { SidePanel } from '../side-panel/side-panel';

export type FilterPanelLayout = 'drawer' | 'side' | 'top';

@Component({
  selector: 'app-catalogue-component',
  imports: [
    SidePanel,
    SearchInput,
    ResultHeader,
    ResultViewComponent,
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
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.scss',
  viewProviders: [provideIcons({ faSolidFilter, faSolidXmark })],
})
export class CatalogueComponent extends SearchBase {
  visible = false;
  filterPanelMode = signal<FilterPanelLayout>('side');

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  resultsLayoutOptions = computed(() => {
    return this.appConfiguration().config?.apps.search?.resultsLayoutOptions || [];
  });

  get hasResults(): boolean {
    return this.search?.totalCount() > 0;
  }
}
