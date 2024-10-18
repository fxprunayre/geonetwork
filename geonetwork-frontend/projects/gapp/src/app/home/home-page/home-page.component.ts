import { Component, inject, OnInit, signal } from '@angular/core';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_PAGE_SIZE,
  SearchAggComponent,
  SearchAggLayout,
  SearchContextDirective,
  SearchResultsCarouselComponent,
  SearchResultsFirstOverviewAsBackgroundDirective,
  SearchResultsTimelineComponent,
} from 'glib';
import { Info, Params } from '../../../../../gapi/src/lib/ui-settings';
import { Sort } from '@elastic/elasticsearch/lib/api/types';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'gn-home-page',
  templateUrl: './home-page.component.html',
  standalone: true,
  styleUrl: './home-page.component.css',
  imports: [
    SearchContextDirective,
    SearchAggComponent,
    SearchResultsTimelineComponent,
    SearchResultsCarouselComponent,
    SearchResultsFirstOverviewAsBackgroundDirective,
    CarouselModule,
  ],
})
export class HomePageComponent implements OnInit {
  panels = signal<Info[]>([]);

  ngOnInit(): void {
    this.panels.set(
      this.uiConfiguration?.mods?.home.info.map(info => {
        if (info.params) {
          return {
            ...info,
            sort: this.#getSort(info.params),
            size: this.#getSize(info.params),
            filter: this.#getFilter(info.params),
          };
        } else {
          return info;
        }
      }) as Info[]
    );
  }

  protected readonly SearchAggLayout = SearchAggLayout;

  uiConfiguration = inject(APPLICATION_CONFIGURATION).ui;

  #getSort(params: Params): Sort {
    return params.sortBy ? [{ [params.sortBy]: params.sortOrder }] : ['_score'];
  }

  #getSize(params: Params): number {
    console.log('getSize', params);
    return params.to ? params.to : DEFAULT_PAGE_SIZE;
  }

  #getFilter(params: Params): string {
    return Object.keys(params).reduce((acc, key) => {
      if (!['from', 'to', 'sortBy', 'sortOrder'].includes(key)) {
        return acc + `+${key}:${params[key]}`;
      }
      return acc;
    }, '');
  }
}
