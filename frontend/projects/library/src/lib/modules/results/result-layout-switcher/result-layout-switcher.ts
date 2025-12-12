import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidList, faSolidTableCellsLarge } from '@ng-icons/font-awesome/solid';
import { SelectButton } from 'primeng/selectbutton';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-result-layout-switcher',
  standalone: true,
  imports: [NgIcon, SelectButton, FormsModule],
  templateUrl: './result-layout-switcher.html',
  viewProviders: [provideIcons({ faSolidList, faSolidTableCellsLarge })],
})
export class ResultLayoutSwitcher {
  options = input.required<SearchAppLayout[]>();
  layout = input.required<SearchAppLayout>();
  layoutChange = output<SearchAppLayout>();

  setLayout(l: SearchAppLayout) {
    if (this.layout() !== l) {
      this.layoutChange.emit(l);
    }
  }
}
