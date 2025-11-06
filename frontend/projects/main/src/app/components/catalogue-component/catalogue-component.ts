import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { SidePanel } from '../side-panel/side-panel';
import { ResultViewComponent, SearchActiveFilters, SearchInput, SortResults } from 'gn-library';
import { ResultHeader } from '../result-header/result-header';
import { Drawer } from 'primeng/drawer';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter } from '@ng-icons/font-awesome/solid';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SearchBase } from 'gn-library';
import { Router } from '@angular/router';

export type FilterPanelLayout = 'drawer' | 'side' | 'top';

@Component({
  selector: 'app-catalogue-component',
  imports: [
    SidePanel,
    ResultViewComponent,
    SearchInput,
    ResultHeader,
    ResultViewComponent,
    Drawer,
    Button,
    ButtonLabel,
    NgIcon,
    Select,
    ButtonIcon,
    FormsModule,
    SortResults,
  ],
  standalone: true,
  templateUrl: './catalogue-component.html',
  viewProviders: [provideIcons({ faSolidFilter })],
})
export class CatalogueComponent extends SearchBase {
  bgFirst = 'images/bgFirst.jpg';
  visible = false;
  filterPanelMode = signal<FilterPanelLayout>('drawer');

  get hasResults(): boolean {
    return this.search?.totalCount() > 0;
  }
  router = inject(Router);

  handleRecordClick = (uuid: string) => {
    this.router.navigate(['/record/', uuid]);
  };
}
