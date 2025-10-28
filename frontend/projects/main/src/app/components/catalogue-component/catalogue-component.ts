import { Component, signal } from '@angular/core';
import { SidePanel } from '../side-panel/side-panel';
import { SearchInput, ResultViewComponent } from 'gn-library';
import { ResultHeader } from '../result-header/result-header';
import { Drawer } from 'primeng/drawer';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidFilter } from '@ng-icons/font-awesome/solid';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { SortResults } from '../sort-results/sort-results';

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
export class CatalogueComponent {
  visible = false;
  filterPanelMode = signal<FilterPanelLayout>('drawer');
}
