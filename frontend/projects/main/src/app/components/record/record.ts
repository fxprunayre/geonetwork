import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidXmark } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_TAB,
  HistoryService,
  RECORD_ROUTE_PATH,
  RecordView,
  SEARCH_ROUTE_PATH,
  VALID_TABS,
} from 'gn-library';
import { ButtonIcon, ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [RecordView, CommonModule, ButtonModule, ButtonIcon, CardModule, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidXmark,
    }),
  ],
  templateUrl: './record.html',
})
export class RecordComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private historyService = inject(HistoryService);

  uuid = signal<string | null>(null);
  tab = signal<string>(DEFAULT_TAB);

  @ViewChild('recordDetails') contentRef!: ElementRef<HTMLDivElement>;

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  bannerBackground = computed(() => this.appConfiguration().config?.bannerBackground || '');

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.uuid.set(params.get('uuid'));
      let tab = params.get('tab') || DEFAULT_TAB;
      if (!VALID_TABS.includes(tab)) {
        this.router.navigate([RECORD_ROUTE_PATH, this.uuid()], {
          relativeTo: this.route,
          replaceUrl: true,
        });
        tab = DEFAULT_TAB;
      }
      this.tab.set(tab);
      this.contentRef &&
        this.contentRef.nativeElement.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }

  handleRecordClick = (uuid: string) => {
    this.router.navigate([RECORD_ROUTE_PATH, uuid]);
  };

  goBack() {
    this.historyService.goBackToLastMatching(SEARCH_ROUTE_PATH);
  }
}
