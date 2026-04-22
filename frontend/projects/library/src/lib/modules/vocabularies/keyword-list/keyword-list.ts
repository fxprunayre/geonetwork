import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { InspireThemeStylesComponent } from '../../search-filter/aggregation-bucket-decorator/inspire-theme-styles';
import { SearchBase } from '../../search/search-base/search-base';
import { SearchLink } from '../../search/search-link/search-link';

@Component({
  selector: 'app-keyword-list',
  standalone: true,
  imports: [
    Chip,
    NgIcon,
    OverlayModule,
    PopoverModule,
    SearchLink,
    Skeleton,
    TranslatePipe,
    InspireThemeStylesComponent,
  ],
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

  isInspireTheme = computed<boolean>(() => {
    const vocabId = this.vocabulary()['id'] || '';
    return vocabId.includes('httpinspireeceuropaeutheme-theme');
  });

  getInspireThemeClass(keyword: Keyword): string {
    if (!keyword || !keyword.link) return '';
    return (
      'iti-' + keyword.link.replace(new RegExp('http://inspire.ec.europa.eu/theme/(.*)'), '$1')
    );
  }

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
