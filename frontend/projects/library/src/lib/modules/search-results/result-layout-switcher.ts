import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidList, faSolidTable, faSolidTableCellsLarge } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectButton } from 'primeng/selectbutton';
import { SearchAppLayout } from '../config/model/gnConfig';
import { SearchService } from '../search/search-service';
import { SearchStoreType } from '../search/search-store';

@Component({
  selector: 'app-result-layout-switcher',
  standalone: true,
  imports: [FormsModule, NgIcon, SelectButton, TranslatePipe],
  template: `
    @if (search().hasResults()) {
      <p-selectButton
        [options]="options()"
        [ngModel]="layout()"
        (ngModelChange)="setLayout($event)"
        [allowEmpty]="false"
      >
        <ng-template let-item #item>
          <ng-icon
            [title]="'results.layout.' + item | translate"
            [name]="
              item === 'list'
                ? 'faSolidList'
                : item === 'grid'
                  ? 'faSolidTableCellsLarge'
                  : 'faSolidTable'
            "
          />
        </ng-template>
      </p-selectButton>
    }
  `,
  viewProviders: [provideIcons({ faSolidList, faSolidTableCellsLarge, faSolidTable })],
})
export class ResultLayoutSwitcher {
  scope = input<string>('main');
  searchService = inject(SearchService);
  search = computed(() => this.searchService.getSearch<SearchStoreType>(this.scope()));

  options = input.required<SearchAppLayout[]>();
  layout = input.required<SearchAppLayout>();
  layoutChange = output<SearchAppLayout>();

  setLayout(l: SearchAppLayout) {
    if (this.layout() !== l) {
      this.layoutChange.emit(l);
    }
  }
}
