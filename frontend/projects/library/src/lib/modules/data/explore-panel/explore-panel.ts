import { Component, computed, inject, input, signal } from '@angular/core';
import { DatasourceSelect } from '../datasource-select/datasource-select';
import { Fieldset } from 'primeng/fieldset';
import { NgIcon } from '@ng-icons/core';
import { Perspective } from '../perspective/perspective';
import { Datasource, DuckDbService } from '../duck-db.service';
import { IndexRecord } from 'gn-api-client';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-explore-panel',
  imports: [DatasourceSelect, Fieldset, NgIcon, Perspective, TranslatePipe],
  templateUrl: './explore-panel.html',
})
export class ExplorePanel {
  record = input.required<IndexRecord>();
  datasource = signal<Datasource | undefined>(undefined);

  duckdbService = inject(DuckDbService);

  datasources = computed(() => {
    const record = this.record();
    if (!record) {
      return [];
    }
    return this.duckdbService.getSupportedDatasource(record);
  });
}
