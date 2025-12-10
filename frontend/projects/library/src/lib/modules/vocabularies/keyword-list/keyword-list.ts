import { Component, computed, inject, input, signal } from '@angular/core';
import { Chip } from 'primeng/chip';
import { PopoverModule } from 'primeng/popover';
import { OverlayModule } from 'primeng/overlay';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { KeyValuePipe } from '@angular/common';
import { RegistriesService } from 'gn4-api-client';
import { firstValueFrom } from 'rxjs';

export interface Keyword {
  default: string;
  vocabulary: string;
  uri: string;
  [key: string]: any;
}

@Component({
  selector: 'app-keyword-list',
  standalone: true,
  imports: [Chip, PopoverModule, OverlayModule, Button, ProgressSpinner, KeyValuePipe],
  templateUrl: './keyword-list.html',
})
export class KeywordList {
  private registries = inject(RegistriesService);
  title = input<string | undefined>();
  keywords = input.required<Keyword[]>();
  activeKeyword = signal<Keyword | null>(null);
  definition = signal<string | null>(null);
  loading = signal(false);

  async openPopover(event: MouseEvent, keyword: Keyword, pop: any) {
    this.activeKeyword.set(keyword);
    this.definition.set(null);
    this.loading.set(true);

    pop.toggle(event);

    try {
      const res = await firstValueFrom(this.registries.searchKeywords(keyword.uri));
      const def = (res as any)?.data?.[0]?.definition ?? null;
      this.definition.set(def);
    } catch {
      this.definition.set(null);
    }

    this.loading.set(false);
  }

  search(keyword: Keyword | null) {
    console.log('TODO: implement keyword search', keyword);
  }

  vocabGroups = computed(() => {
    const groups: Record<string, Keyword[]> = {};
    for (const k of this.keywords()) {
      if (!groups[k.vocabulary]) groups[k.vocabulary] = [];
      groups[k.vocabulary].push(k);
    }
    return groups;
  });
}
