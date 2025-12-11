import { Component, inject, signal } from '@angular/core';
import { SidePanel } from '../side-panel/side-panel';
import { ResultViewComponent, SearchBase, SearchInput, SearchWelcomeTextPipe } from 'gn-library';
import { ResultHeader } from '../result-header/result-header';
import { Drawer } from 'primeng/drawer';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { NgClass } from '@angular/common';

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
    ButtonLabel,
    NgIcon,
    ButtonIcon,
    InputGroup,
    InputGroupAddon,
    FormsModule,
    TranslatePipe,
    SearchWelcomeTextPipe,
    OverlayBadgeModule,
    NgClass,
  ],
  standalone: true,
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.scss',
  viewProviders: [provideIcons({ faSolidFilter, faSolidXmark })],
})
export class CatalogueComponent extends SearchBase {
  visible = false;
  filterPanelMode = signal<FilterPanelLayout>('side');

  get hasResults(): boolean {
    return this.search?.totalCount() > 0;
  }
}
