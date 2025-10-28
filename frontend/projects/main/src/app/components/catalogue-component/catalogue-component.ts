import { Component } from '@angular/core';
import { SidePanel } from '../side-panel/side-panel';
import { SearchInput, ResultViewComponent } from 'gn-library';
import { ResultHeader } from '../result-header/result-header';
import { Drawer } from 'primeng/drawer';
import { Button, ButtonLabel } from 'primeng/button';
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
    SortResults,
  ],
  standalone: true,
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.scss',
})
export class CatalogueComponent {
  visible = false;
  filterPanelMode: FilterPanelLayout = 'side';
}
