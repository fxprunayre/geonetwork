import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidFile,
  faSolidMap,
  faSolidTable,
  faSolidTableList,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord, Link } from 'gn-api-client';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { SelectButton } from 'primeng/selectbutton';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import {
  DEFAULT_MAP_CONTEXT,
  MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
} from '../../config/gn-constants';
import { Gn4MapCommand } from '../../record-distributions/map-service';
import { DataModelPanel } from '../../record/datamodel/data-model-panel/data-model-panel';
import { DatasourceSelect } from '../datasource-select/datasource-select';
import { Datasource } from '../datasource.model';
import { ExploreDatavizPanel } from '../dataviz-panel/dataviz-panel';
import { DatavizSelect } from '../dataviz-select/dataviz-select';
import { DatavizSource } from '../dataviz.model';
import { DuckDbService } from '../duck-db-service';
import { MapPanel } from '../map-panel/map-panel';
import { Perspective } from '../perspective/perspective';

@Component({
  selector: 'app-explore-panel',
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    DataModelPanel,
    DatasourceSelect,
    DatavizSelect,
    ExploreDatavizPanel,
    FormsModule,
    MapPanel,
    NgTemplateOutlet,
    NgIcon,
    Perspective,
    SelectButton,
    TranslatePipe,
  ],
  viewProviders: [provideIcons({ faSolidFile, faSolidMap, faSolidTable, faSolidTableList })],
  templateUrl: './explore-panel.html',
})
export class ExplorePanel {
  record = input.required<IndexRecord>();
  activeTab = input<string>('explore');
  layout = input<'accordion' | 'selectbutton'>('selectbutton');
  datasource = signal<Datasource | undefined>(undefined);
  selectedDataviz = signal<DatavizSource | undefined>(undefined);
  selectedPanel = signal<string>('');

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  duckdbService = inject(DuckDbService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  mapContext = computed<Record<string, unknown>>(
    () =>
      (this.appConfiguration().config?.apps?.map?.context || DEFAULT_MAP_CONTEXT) as Record<
        string,
        unknown
      >,
  );

  mapLayerDisplayTarget = computed(
    () =>
      this.appConfiguration().config?.apps?.record?.mapLayerDisplayTarget ||
      MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  );

  isEmbeddedWmsMapEnabled = computed(
    () => true,
    // this.mapLayerDisplayTarget() === MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP,
  );

  datasources = computed(() => {
    const record = this.record();
    if (!record) {
      return [];
    }
    return this.duckdbService.getSupportedDatasource(record);
  });

  queryParams = toSignal(this.route.queryParams);

  embeddedWmsCommands = computed<Gn4MapCommand[]>(() => {
    if (!this.isEmbeddedWmsMapEnabled()) {
      return [];
    }

    const links = this.record()?.link || [];
    return links
      .filter((link) => this.isEmbeddedWmsLink(link))
      .map((link) => {
        const rawUrl = link.urlObject?.['default'];
        if (!rawUrl) {
          return null;
        }

        const isWmts = (link.protocol || '').includes('OGC:WMTS');
        const name = link.nameObject?.['default'] || '';
        const label = link.descriptionObject?.['default'] || link.nameObject?.['default'] || name;

        return {
          type: isWmts ? 'wmts' : 'wms',
          url: encodeURIComponent(rawUrl),
          name: name ? encodeURIComponent(name) : undefined,
          label: label ? encodeURIComponent(label) : undefined,
        } as Gn4MapCommand;
      })
      .filter((cmd): cmd is Gn4MapCommand => !!cmd);
  });

  wmsCommands = computed<Gn4MapCommand[]>(() => {
    const qp = this.queryParams();
    const rawCommand = qp?.['wmsAdd'];
    if (!rawCommand || !this.isEmbeddedWmsMapEnabled()) {
      return [];
    }

    try {
      return JSON.parse(rawCommand) as Gn4MapCommand[];
    } catch (e) {
      console.warn('Error parsing WMS add commands', e);
      return [];
    }
  });

  hasEmbeddedWmsLayers = computed(() => this.embeddedWmsCommands().length > 0);

  hasDatasourceSection = computed(() => this.datasources().length > 0);

  datavizSources = computed<DatavizSource[]>(() => {
    const links = this.record()?.link || [];
    const datavizLinks = links
      .filter(
        (link) =>
          link?.protocol === 'WWW:LINK:DATAVIZ' || link?.protocol === 'WWW:LINK:JUPYTER-NOTEBOOK',
      )
      .map((link) => {
        const url = link.urlObject?.['default'];
        if (!url) {
          return null;
        }
        return {
          url,
          name: link.nameObject?.['default'] || link.descriptionObject?.['default'] || url,
          protocol: link.protocol || 'WWW:LINK:DATAVIZ',
        };
      })
      .filter((entry): entry is DatavizSource => !!entry);

    return Array.from(new Map(datavizLinks.map((entry) => [entry.url, entry])).values());
  });

  datavizUrl = computed(() => {
    return this.selectedDataviz()?.url;
  });

  hasDatavizSection = computed(() => this.datavizSources().length > 0);

  hasDataModel = computed(() => {
    const record = this.record();
    return !!record.info?.hasDataModel;
  });

  activePanels = computed(() => {
    const panels: string[] = [];
    if (this.isEmbeddedWmsMapEnabled() && this.hasEmbeddedWmsLayers()) {
      panels.push('map');
    }
    if (this.hasDatasourceSection()) {
      panels.push('table-data');
    }
    if (this.hasDatavizSection()) {
      panels.push('dataviz');
    }
    if (this.hasDataModel()) {
      panels.push('data-model');
    }
    return panels;
  });

  panelOptions = computed(() => {
    const options: { label: string; value: string; icon: string }[] = [];
    if (this.isEmbeddedWmsMapEnabled() && this.hasEmbeddedWmsLayers()) {
      options.push({ label: 'map', value: 'map', icon: 'faSolidMap' });
    }
    if (this.hasDatasourceSection()) {
      options.push({ label: 'exploreData', value: 'table-data', icon: 'faSolidTableList' });
    }
    if (this.hasDatavizSection()) {
      options.push({ label: 'data.dataviz.title', value: 'dataviz', icon: 'faSolidFile' });
    }
    if (this.hasDataModel()) {
      options.push({
        label: 'record.view.section.dataModel',
        value: 'data-model',
        icon: 'faSolidTable',
      });
    }
    return options;
  });

  constructor() {
    effect(() => {
      const layout = this.layout();
      const panels = this.activePanels();
      if (layout === 'selectbutton' && panels.length > 0 && !this.selectedPanel()) {
        this.selectedPanel.set(panels[0]);
      }
    });

    effect(() => {
      const sources = this.datasources();
      const qp = this.queryParams();
      const active = this.activeTab();

      console.log(qp);
      this.selectedPanel.set(
        qp && qp['wmsAdd'] ? 'map' : qp && qp['datasource'] ? 'table-data' : this.activePanels()[0],
      );

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

    effect(() => {
      const sources = this.datavizSources();
      const qp = this.queryParams();
      const active = this.activeTab();
      if (active !== 'explore') {
        return;
      }

      if (sources.length === 0) {
        if (untracked(() => this.selectedDataviz())) {
          this.selectedDataviz.set(undefined);
        }
        return;
      }

      const current = untracked(() => this.selectedDataviz());
      const selectedFromUrl = qp?.['dataviz'] || qp?.['notebook'];
      if (typeof selectedFromUrl === 'string') {
        const matched = sources.find((source) => source.url === selectedFromUrl);
        if (matched && matched !== current) {
          this.selectedDataviz.set(matched);
        } else if (
          !matched &&
          (!current || !sources.some((source) => source.url === current.url))
        ) {
          this.selectedDataviz.set(sources[0]);
        }
      } else if (!current || !sources.some((source) => source.url === current.url)) {
        this.selectedDataviz.set(sources[0]);
      }
    });

    effect(() => {
      const dataviz = this.selectedDataviz();
      if (dataviz) {
        const qp = untracked(() => this.queryParams());
        if (!qp || qp['dataviz'] !== dataviz.url) {
          this.router.navigate([], {
            queryParams: { dataviz: dataviz.url, notebook: null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      }
    });
  }

  private isEmbeddedWmsLink(link: Link): boolean {
    const protocol = link.protocol || '';
    return (
      !!link.urlObject?.['default'] &&
      !!protocol.match('OGC:WMS|OGC:WMTS|application/vnd.ogc.wms_xml')
    );
  }
}
