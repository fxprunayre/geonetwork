import { Component, computed, inject, input, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Chip } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { OverlayModule } from 'primeng/overlay';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RegistriesService } from 'gn4-api-client';
import { TranslateService } from '@ngx-translate/core';
import { SearchBase } from '../../search/search-base/search-base';
import { faSolidMagnifyingGlass, faSolidTag } from '@ng-icons/font-awesome/solid';
import { NgIcon, provideIcons } from '@ng-icons/core';

export interface Keyword {
  default: string;
  vocabulary?: string | null;
  uri?: string | null;
}

@Component({
  selector: 'app-keyword-list',
  standalone: true,
  imports: [Chip, PopoverModule, OverlayModule, ProgressSpinner, KeyValuePipe, NgIcon],
  templateUrl: './keyword-list.html',
  viewProviders: [
    provideIcons({
      faSolidTag,
      faSolidMagnifyingGlass,
    }),
  ],
})
export class KeywordList extends SearchBase {
  private readonly registries = inject(RegistriesService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  title = input<string | undefined>();
  keywords = input.required<Keyword[]>();
  activeKeyword = signal<Keyword | null>(null);
  definition = signal<string | null>(null);
  loading = signal(false);

  async openPopover(event: MouseEvent, keyword: Keyword, pop: any) {
    this.activeKeyword.set(keyword);
    this.definition.set(null);

    if (!keyword.uri) {
      this.loading.set(false);
      pop.toggle(event);
      return;
    }

    this.loading.set(true);
    pop.toggle(event);

    try {
      const res = await firstValueFrom(
        this.registries.searchKeywords(
          undefined,
          this.translate.getCurrentLang(),
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          keyword.uri,
        ),
      );

      const first = (res as any)?.values?.[0];
      this.definition.set(first?.definition ?? null);
    } catch {
      this.definition.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  onKeywordClick(keyword: Keyword | null) {
    if (!keyword) return;

    this.search.reset();

    if (keyword.vocabulary && keyword.uri) {
      this.search.addFilter(keyword.vocabulary, keyword.uri);
    } else {
      this.search.setFullTextQuery(keyword.default);
    }

    this.search.search(this.search.searchFilterParameters());

    const query = keyword.default.replace(/^\/+/, '');

    this.router.navigate(['/search'], {
      queryParams: { q: query },
    });
  }

  vocabGroups = computed(() => {
    const groups: Record<string, Keyword[]> = {};

    for (const keyword of this.keywords()) {
      const key = keyword.vocabulary ?? 'free';
      (groups[key] ??= []).push(keyword);
    }

    return groups;
  });
}
