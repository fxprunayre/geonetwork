import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass, faSolidTag } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Keyword, Thesaurus } from 'gn-api-client';
import { RegistriesService } from 'gn4-api-client';
import { Chip } from 'primeng/chip';
import { OverlayModule } from 'primeng/overlay';
import { PopoverModule } from 'primeng/popover';
import { Skeleton } from 'primeng/skeleton';
import { firstValueFrom } from 'rxjs';
import { SearchBase } from '../../search/search-base/search-base';
import { SearchLink } from '../../search/search-link/search-link';
import { SEARCH_ROUTE_PATH } from '../../search/search-constant';

@Component({
  selector: 'app-keyword-list',
  standalone: true,
  imports: [Chip, PopoverModule, OverlayModule, NgIcon, TranslatePipe, Skeleton, SearchLink],
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

  vocabulary = input.required<Thesaurus>();

  keywords = computed<Keyword[]>(() => {
    const vocab = this.vocabulary();
    return (vocab.keywords || []) as Keyword[];
  });

  title = computed<string>(() => {
    const title = this.vocabulary()['multilingualTitle']?.['default'];
    if (title) {
      return title;
    }
    const freeTextTitle = this.vocabulary()['title'];
    if (freeTextTitle && freeTextTitle.startsWith('otherKeywords-')) {
      // Keyword type translations loaded from i18n API call
      const type = freeTextTitle.replace('otherKeywords-', '');
      if (type != '') {
        return this.translate.instant(type);
      }
    }
    return this.translate.instant('vocabulary.otherKeywords');
  });

  activeKeyword = signal<Keyword | null>(null);

  keywordDefinitionFetcher = resource({
    params: () => {
      const keyword = this.activeKeyword();
      return keyword?.link ? { link: keyword.link } : undefined;
    },
    loader: async ({ params }) => {
      if (!params?.link) return null;
      try {
        const res = (await firstValueFrom(
          this.registries.searchKeywords(
            undefined,
            this.translate.getCurrentLang(),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            params.link,
          ),
        )) as any[];
        return res.length > 0 ? (res[0] as any)?.definition : null;
      } catch {
        return null;
      }
    },
  });

  async openPopover(event: MouseEvent, keyword: Keyword, pop: any) {
    this.activeKeyword.set(keyword);
    pop.toggle(event);
  }
}
