import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import { SEARCH_ROUTE_PATH } from '../search-constant';

@Component({
  selector: 'app-search-link',
  standalone: true,
  imports: [NgIcon, RouterLink],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass })],
  template: `
    <a
      [routerLink]="link()"
      [queryParams]="queryParams()"
      class="cursor-pointer group w-full flex flex-row items-center gap-2"
      [title]="computedTitle()"
    >
      <ng-content />
      <ng-icon name="faSolidMagnifyingGlass" class="grow text-surface-500" />
    </a>
  `,
})
export class SearchLink {
  value = input.required<string>();
  field = input<string>('q');
  title = input<string>('');
  quote = input<boolean>(true);

  translate = inject(TranslateService);

  protected readonly link = computed(() => [SEARCH_ROUTE_PATH]);

  computedTitle = computed(() =>
    this.title() !== ''
      ? this.title()
      : this.translate.instant('search.searchLink', { value: this.value() }),
  );

  protected queryParams = computed(() => {
    const val = this.quote() ? `"${this.value()}"` : this.value();
    return { [this.field()]: val };
  });
}
