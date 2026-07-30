import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, effect, inject, input, output, TemplateRef } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidPlugCircleExclamation } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { MessageModule } from 'primeng/message';
import { AlertPanel } from '../../../shared/widgets/alert-panel/alert-panel';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { SearchBase } from '../../search/search-base/search-base';
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
export class ResultsView extends SearchBase {
  layout = input<SearchAppLayout>('grid');
  recordClick = output<string>();

  private readonly searchMapOverlayService = inject(SearchMapOverlayService);

  @ContentChild('searchProgressTemplate') searchProgressTemplate: TemplateRef<unknown> | undefined;

  constructor() {
    super();
    effect(() => {
      this.searchMapOverlayService.setPageResults(this.scope(), this.search().results());
    });
  }

  handleRecordClick(uuid: string) {
    this.recordClick.emit(uuid);
  }

  handleRecordHover(result: IndexRecord | null) {
    const recordId = result?.info?._id || result?.uuid || null;
    this.searchMapOverlayService.setHoveredRecordId(this.scope(), recordId);
  }
}
