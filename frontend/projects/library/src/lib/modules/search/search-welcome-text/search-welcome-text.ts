import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { TranslateDirective, TranslateService } from '@ngx-translate/core';
import { SearchBase } from '../search-base/search-base';

@Component({
  selector: 'app-search-welcome-text',
  templateUrl: './search-welcome-text.html',
  standalone: true,
  imports: [DecimalPipe, TranslateDirective],
})
export class SearchWelcomeText extends SearchBase implements OnInit {
  maxBucketsToShow = input(3);

  translateService = inject(TranslateService);

  RESOURCE_TYPE_FIELD = 'resourceType';

  locale = signal(this.translateService.getCurrentLang());

  ngOnInit() {
    this.translateService.onLangChange.subscribe((lang) => {
      this.locale.set(lang.lang);
    });
  }

  mainBuckets = computed(() => {
    const mainBuckets = this.search().aggregations()[this.RESOURCE_TYPE_FIELD]?.buckets || [];
    if (Array.isArray(mainBuckets)) {
      return mainBuckets
        .slice(0, this.maxBucketsToShow())
        .map((bucket) => this.translateService.instant(bucket.key))
        .join(', ');
    } else {
      return 'resources';
    }
  });
}
