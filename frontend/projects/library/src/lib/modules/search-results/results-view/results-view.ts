import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChild,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { faSolidPlugCircleExclamation } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { MessageModule } from 'primeng/message';
import { AlertPanel } from '../../../shared/widgets/alert-panel/alert-panel';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { SearchBase } from '../../search/search-base/search-base';
import { RECORD_ROUTE_PATH } from '../../search/search-constant';
import { SearchMapOverlayService } from '../../search/search-map-overlay.service';
import { NoResultFound } from '../no-result-found/no-result-found';
import { ResultItemGrid } from '../result-item-grid/result-item-grid';
import { ResultItemList } from '../result-item-list/result-item-list';
import { ResultItemTable } from '../result-item-table/result-item-table';
import { ResultsPaginatorComponent } from '../results-paginator/results-paginator';

@Component({
  selector: 'app-results-view',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NoResultFound,
    ResultItemGrid,
    ResultItemList,
    ResultItemTable,
    ResultsPaginatorComponent,
    TranslatePipe,
    MessageModule,
    AlertPanel,
  ],
  providers: [provideIcons({ faSolidPlugCircleExclamation })],
  templateUrl: './results-view.html',
})
export class ResultsView extends SearchBase implements OnDestroy {
  layout = input<SearchAppLayout>('grid');
  recordClick = output<string>();

  private readonly router = inject(Router);
  private readonly searchMapOverlayService = inject(SearchMapOverlayService);
  private clickNavigationTimer: ReturnType<typeof setTimeout> | null = null;

  @ContentChild('searchProgressTemplate') searchProgressTemplate: TemplateRef<unknown> | undefined;

  constructor() {
    super();
    effect(() => {
      this.searchMapOverlayService.setPageResults(this.scope(), this.search().results());
    });
  }

  ngOnDestroy() {
    if (this.clickNavigationTimer) {
      clearTimeout(this.clickNavigationTimer);
      this.clickNavigationTimer = null;
    }
  }

  handleRecordClick(uuid: string) {
    if (this.clickNavigationTimer) {
      clearTimeout(this.clickNavigationTimer);
    }

    // Let double-click cancel the pending route change.
    this.clickNavigationTimer = setTimeout(() => {
      this.recordClick.emit(uuid);
      this.router.navigate([RECORD_ROUTE_PATH, uuid]);
      this.clickNavigationTimer = null;
    }, 220);
  }

  handleRecordHover(result: IndexRecord | null) {
    const recordId = result?.info?._id || result?.uuid || null;
    this.searchMapOverlayService.setHoveredRecordId(this.scope(), recordId);
  }

  handleRecordDoubleClick(result: IndexRecord | null) {
    if (this.clickNavigationTimer) {
      clearTimeout(this.clickNavigationTimer);
      this.clickNavigationTimer = null;
    }

    const recordId = result?.info?._id || result?.uuid;
    if (!recordId) {
      return;
    }
    this.searchMapOverlayService.requestZoomToRecord(this.scope(), recordId);
  }
}
