import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonIcon, ButtonLabel, ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowLeft } from '@ng-icons/font-awesome/solid';
import { RecordView } from 'gn-library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEFAULT_TAB } from 'gn-library';
import { HistoryService, RECORD_ROUTE_PATH, SEARCH_ROUTE_PATH } from 'gn-library';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [
    RecordView,
    CommonModule,
    ButtonModule,
    ButtonLabel,
    ButtonIcon,
    CardModule,
    NgIcon,
    TranslatePipe,
  ],
  viewProviders: [
    provideIcons({
      faSolidArrowLeft,
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

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.uuid.set(params.get('uuid'));
      this.tab.set(params.get('tab') || DEFAULT_TAB);
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
