import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button, ButtonIcon } from 'primeng/button';
import { SearchBase } from '../search-base/search-base';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidXmark } from '@ng-icons/font-awesome/solid';
import { faMap } from '@ng-icons/font-awesome/regular';
import { TranslatePipe } from '@ngx-translate/core';
import { AutoFocus } from 'primeng/autofocus';
import { NgTemplateOutlet } from '@angular/common';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FormsModule,
    InputText,
    InputGroup,
    InputGroupAddon,
    Button,
    NgIcon,
    ButtonIcon,
    TranslatePipe,
    AutoFocus,
    Popover,
  ],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass, faSolidXmark, faMap })],
  templateUrl: './search-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInput extends SearchBase implements OnInit {
  autofocus = input<boolean>(true);
  searchOnInput = input<boolean>(true);

  popOverTemplate = input<TemplateRef<unknown>>();
  op = viewChild<Popover>('op');

  onSearch = output();

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

  handleInputClick(event: MouseEvent) {
    if (this.op()) {
      this.op()?.toggle(event);
    }
  }

  clearQuery() {
    this.search.setFullTextQuery('');
  }
}
