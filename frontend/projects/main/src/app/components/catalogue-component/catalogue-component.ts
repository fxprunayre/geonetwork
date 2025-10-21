import { Component } from '@angular/core';
import { SidePanel } from '../side-panel/side-panel';
import { ResultViewComponent } from '../result-view-component/result-view-component';
import { SearchInput } from 'gn-library';

@Component({
  selector: 'app-catalogue-component',
  imports: [SidePanel, ResultViewComponent, SearchInput],
  standalone: true,
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.scss',
})
export class CatalogueComponent {}
