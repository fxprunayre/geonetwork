import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, ButtonIcon } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { SearchBase } from '../../search/search-base/search-base';

@Component({
  selector: 'app-search-active-filters-button',
  imports: [Button, ButtonIcon, InputGroup, InputGroupAddon, NgIcon, TranslatePipe],
  template: `<div>
    <p-inputgroup
      [dt]="{
        colorScheme: {
          light: { addon: { borderColor: 'none', background: 'bg-primary-500' } },
        },
      }"
    >
      <p-inputgroup-addon>
        <p-button
          size="large"
          (click)="toggleState()"
          [title]="'search.filter.panel.open' | translate"
        >
          <ng-icon name="faSolidFilter" pButtonIcon></ng-icon>
        </p-button>
      </p-inputgroup-addon>
      @if (search.activeFilterCount() > 0) {
        <p-inputgroup-addon>
          <p-button size="large" (click)="search.reset()" [badge]="search.activeFilterCount() + ''">
            <ng-icon name="faSolidXmark" pButtonIcon></ng-icon>
          </p-button>
        </p-inputgroup-addon>
      }
    </p-inputgroup>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchActiveFiltersButton extends SearchBase {
  visible = model(false);
  toggleState() {
    this.visible.set(!this.visible());
  }
}
