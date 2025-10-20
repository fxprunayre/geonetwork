import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
  input,
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
  selector: 'app-search-component',
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
  templateUrl: './search-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBox extends SearchBase implements OnInit {
  query = input<string>('');
  // TODO: Make this generic
  isHomepage = input<boolean>(false);
  autofocus = input<boolean>(false);
  @Output() queryChange = new EventEmitter<string>();

  readonly store = inject(SearchStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  onModelChange($event: string) {
    this.search.setFullTextQuery($event);
    this.queryChange.emit($event);
  }

  override ngOnInit() {
    super.ngOnInit();
    const urlQuery = this.route.snapshot.queryParamMap.get('q') || '';
    if (urlQuery) {
      this.onModelChange(urlQuery);
    }

    this.route.queryParamMap.subscribe((params) => {
      const newQuery = params.get('q') || '';
      if (newQuery !== this.query()) {
        this.queryChange.emit(newQuery);
      }
    });
  }

  clearQuery() {
    this.onModelChange('');
    this.updateUrlAndSearch('');
  }
  //
  // onInput(event: Event) {
  //   if (this.isHomepage) return;
  //
  //   const target = event.target as HTMLInputElement;
  //   const value = target?.value || '';
  //   this.query = value;
  //   this.queryChange.emit(value);
  //
  //   this.updateUrlAndSearch(value.trim());
  // }
  //
  // onKeyDown(event: KeyboardEvent) {
  //   if (this.isHomepage && event.key === 'Enter') {
  //     this.onSearch();
  //   }
  // }

  private updateUrlAndSearch(query: string) {
    // TODO: Route changes should be handled in the SearchStore with routing enabled
    // if (this.isHomepage) {
    //   this.router.navigate(['/catalogue'], {
    //     queryParams: {
    //       q: query || null,
    //       page: null,
    //       size: null,
    //     },
    //     queryParamsHandling: 'merge',
    //   });
    // } else {
    //   this.router.navigate([], {
    //     relativeTo: this.route,
    //     queryParams: {
    //       q: query || null,
    //       page: null,
    //       size: null,
    //     },
    //     queryParamsHandling: 'merge',
    //   });
    // }
  }
}
