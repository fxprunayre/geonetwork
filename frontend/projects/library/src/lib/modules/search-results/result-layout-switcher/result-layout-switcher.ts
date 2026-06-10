import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidList, faSolidTable, faSolidTableCellsLarge } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectButton } from 'primeng/selectbutton';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { SearchBase } from '../../search/search-base/search-base';

@Component({
  selector: 'app-result-layout-switcher',
  standalone: true,
  imports: [FormsModule, NgIcon, SelectButton, TranslatePipe],
  templateUrl: './result-layout-switcher.html',
  viewProviders: [provideIcons({ faSolidList, faSolidTableCellsLarge, faSolidTable })],
})
export class ResultLayoutSwitcher extends SearchBase {
  options = input.required<SearchAppLayout[]>();
  layout = input.required<SearchAppLayout>();
  layoutChange = output<SearchAppLayout>();

  setLayout(l: SearchAppLayout) {
    if (this.layout() !== l) {
      this.layoutChange.emit(l);
    }
  }
}
