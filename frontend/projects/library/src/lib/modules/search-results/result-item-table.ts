import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { TableModule } from 'primeng/table';
import { TimeAgoPipe } from '../../shared/time-ago.pipe';
import { RecordFieldTitle, RecordFieldType } from '../record';
import { RECORD_ROUTE_PATH } from '../search/search-constant';

@Component({
  selector: 'app-result-item-table',
  templateUrl: './result-item-table.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterLink,
    TranslatePipe,
    RecordFieldTitle,
    RecordFieldType,
    TimeAgoPipe,
  ],
})
export class ResultItemTable {
  results = input<IndexRecord[]>([]);
  navigateOnClick = input<boolean>(true);
  recordClick = output<string>();
  recordHover = output<IndexRecord | null>();
  recordDoubleClick = output<IndexRecord>();

  protected readonly RECORD_ROUTE_PATH = RECORD_ROUTE_PATH;
}
