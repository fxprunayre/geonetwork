import { Component } from '@angular/core';
import { SidePanel } from '../side-panel/side-panel';
import { SearchInput, ResultViewComponent } from 'gn-library';
import { ResultHeader } from '../result-header/result-header';

@Component({
  selector: 'app-catalogue-component',
  imports: [SidePanel, ResultViewComponent, SearchInput, ResultHeader, ResultViewComponent],
  standalone: true,
  templateUrl: './catalogue-component.html',
  styleUrl: './catalogue-component.scss',
})
export class CatalogueComponent {}
