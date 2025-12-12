import { Component, computed, inject, input, signal } from '@angular/core';
import { Chip } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { OverlayModule } from 'primeng/overlay';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { KeyValuePipe } from '@angular/common';
import { RegistriesService } from 'gn4-api-client';
import { firstValueFrom } from 'rxjs';
import { SearchBase } from '../../search/search-base/search-base';
import { Router } from '@angular/router';

export interface Keyword {
  default: string;
  vocabulary?: string | null;
  uri?: string | null;
}

export interface KeywordWithId extends Keyword {
  _id: string;
}

@Component({
  selector: 'app-keyword-list',
  standalone: true,
  imports: [Chip, PopoverModule, OverlayModule, Button, ProgressSpinner, KeyValuePipe],
  templateUrl: './keyword-list.html',
})
export class KeywordList extends SearchBase {
  private registries = inject(RegistriesService);
  private router = inject(Router);

  title = input<string | undefined>();
  keywords = input.required<KeywordWithId[]>();
  activeKeyword = signal<KeywordWithId | null>(null);

  definition = signal<string | null>(null);
  loading = signal(false);

  async openPopover(event: MouseEvent, keyword: KeywordWithId, pop: any) {
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
      const res = await firstValueFrom(this.registries.searchKeywords(keyword.uri));
      const first = (res as any)?.values?.[0];
      const def = first?.definitions?.eng?.trim() || first?.values?.eng?.trim() || null;
      this.definition.set(def || null);
    } catch {
      this.definition.set(null);
    }

    this.loading.set(false);
  }

  onKeywordClick(keyword: KeywordWithId | null) {
    if (!keyword) return;

    this.search.reset();

    if (keyword.vocabulary && keyword.uri) {
      this.search.addFilter(keyword.vocabulary, keyword.uri);
    } else {
      this.search.setFullTextQuery(keyword.default);
    }

    this.search.search(this.search.searchFilterParameters());

    this.router.navigate(['/search'], {
      queryParams: {
        q: keyword.default,
      },
    });
  }

  vocabGroups = computed(() => {
    const groups: Record<string, Keyword[]> = {};

    for (const k of this.keywords()) {
      const vocabKey = k.vocabulary ?? 'free';
      (groups[vocabKey] ??= []).push(k);
    }

    return groups;
  });
}
