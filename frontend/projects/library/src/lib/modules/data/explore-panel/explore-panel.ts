import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { DatasourceSelect } from '../datasource-select/datasource-select';
import { Datasource } from '../datasource.model';
import { DuckDbService } from '../duck-db-service';
import { Perspective } from '../perspective/perspective';

@Component({
  selector: 'app-explore-panel',
  imports: [DatasourceSelect, NgIcon, Perspective, TranslatePipe],
  templateUrl: './explore-panel.html',
})
export class ExplorePanel {
  record = input.required<IndexRecord>();
  activeTab = input<string>('explore');
  datasource = signal<Datasource | undefined>(undefined);

  duckdbService = inject(DuckDbService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  datasources = computed(() => {
    const record = this.record();
    if (!record) {
      return [];
    }
    return this.duckdbService.getSupportedDatasource(record);
  });

  queryParams = toSignal(this.route.queryParams);

  constructor() {
    effect(() => {
      const sources = this.datasources();
      const qp = this.queryParams();
      const active = this.activeTab();
      if (active !== 'explore') {
        return;
      }

      if (sources.length > 0) {
        const currentDs = untracked(() => this.datasource());
        const dsUrl = qp ? qp['datasource'] : null;

        if (dsUrl) {
          const matched = sources.find((s) => s.url === dsUrl);
          if (matched && matched !== currentDs) {
            this.datasource.set(matched);
          }
        } else if (sources.length === 1 && !currentDs) {
          this.datasource.set(sources[0]);
        }
      }
    });

    effect(() => {
      const selectedDs = this.datasource();
      if (selectedDs) {
        const qp = untracked(() => this.queryParams());
        if (!qp || qp['datasource'] !== selectedDs.url) {
          this.router.navigate([], {
            queryParams: { datasource: selectedDs.url },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      }
    });
  }
}
