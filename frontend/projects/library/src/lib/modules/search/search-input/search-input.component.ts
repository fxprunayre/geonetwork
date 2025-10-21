import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button, ButtonIcon } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchStore } from '../search.store';
import { SearchBase } from '../search-base/search-base';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark, faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';
import { faMap } from '@ng-icons/font-awesome/regular';
import { TranslatePipe } from '@ngx-translate/core';
import { AutoFocus } from 'primeng/autofocus';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [
    FormsModule,
    InputText,
    InputGroup,
    InputGroupAddon,
    Button,
    NgIcon,
    ButtonIcon,
    TranslatePipe,
    AutoFocus,
  ],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass, faSolidXmark, faMap })],
  templateUrl: './search-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput extends SearchBase implements OnInit {
  autofocus = input<boolean>(true);
  searchOnInput = input<boolean>(true);

  onSearch = output();

  readonly store = inject(SearchStore);

  queryString = '';

  searchOnClick() {
    this.onModelChange(this.queryString);
  }

  searchOnInputChange($event: string) {
    this.queryString = $event;
    if (this.searchOnInput()) {
      this.onModelChange(this.queryString);
    }
  }

  onModelChange(queryString: string) {
    this.search.setFullTextQuery(queryString);
    this.onSearch.emit();
  }

  clearQuery() {
    this.search.setFullTextQuery('');
  }
}
