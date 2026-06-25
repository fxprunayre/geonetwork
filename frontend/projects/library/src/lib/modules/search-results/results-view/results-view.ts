import { NgTemplateOutlet } from '@angular/common';
import { Component, ContentChild, input, output, TemplateRef } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { faSolidPlugCircleExclamation } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageModule } from 'primeng/message';
import { AlertPanel } from '../../../shared/widgets/alert-panel/alert-panel';
import { SearchAppLayout } from '../../config/model/gnConfig';
import { SearchBase } from '../../search/search-base/search-base';
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
  onRecordClick = output<string>();

  @ContentChild('searchProgressTemplate') searchProgressTemplate: TemplateRef<any> | undefined;

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }
}
