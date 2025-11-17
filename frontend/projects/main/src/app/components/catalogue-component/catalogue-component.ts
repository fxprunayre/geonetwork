import { Component, inject, signal } from '@angular/core';
import { SidePanel } from '../side-panel/side-panel';
import { ResultViewComponent, SearchBase, SearchInput, SortResults } from 'gn-library';
import { ResultHeader } from '../result-header/result-header';
import { Drawer } from 'primeng/drawer';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter } from '@ng-icons/font-awesome/solid';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

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
    Select,
    ButtonIcon,
    FormsModule,
    SortResults,
    TranslatePipe,
  ],
  standalone: true,
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.scss',
  viewProviders: [provideIcons({ faSolidFilter })],
})
export class CatalogueComponent extends SearchBase {
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
