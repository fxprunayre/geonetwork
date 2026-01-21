import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { SearchBase } from '../../search/search-base/search-base';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { NgIcon } from '@ng-icons/core';
import { Button, ButtonIcon } from 'primeng/button';
import { OverlayBadge } from 'primeng/overlaybadge';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-search-active-filters-button',
  imports: [InputGroup, InputGroupAddon, NgIcon, Button, ButtonIcon, OverlayBadge, TranslatePipe],
  template: `<div>
    <p-inputgroup
      class="mt-6 lg:mt-0"
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
          [pt]="{ root: 'h-14' }"
        >
          <ng-icon name="faSolidFilter" pButtonIcon></ng-icon>
        </p-button>
      </p-inputgroup-addon>
      @if (search.activeFilterCount() > 0) {
        <p-inputgroup-addon>
          <p-button size="large" (click)="search.reset()" [pt]="{ root: 'h-14' }">
            <p-overlaybadge [value]="search.activeFilterCount()">
              <ng-icon name="faSolidXmark" pButtonIcon></ng-icon>
            </p-overlaybadge>
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
