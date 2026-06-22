import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidFile,
  faSolidMap,
  faSolidTable,
  faSolidTableList,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import {
  DEFAULT_MAP_CONTEXT,
  MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP,
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
    NgIcon,
    Perspective,
    TranslatePipe,
  ],
  viewProviders: [provideIcons({ faSolidFile, faSolidMap, faSolidTable, faSolidTableList })],
  templateUrl: './explore-panel.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExplorePanel {
  record = input.required<IndexRecord>();
  activeTab = input<string>('explore');
  datasource = signal<Datasource | undefined>(undefined);
  selectedDataviz = signal<DatavizSource | undefined>(undefined);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  duckdbService = inject(DuckDbService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  elementRef = inject(ElementRef);

  viewer: any;
  addedLayerIds = new Set<string>();

  mapContext = computed(
    () => this.appConfiguration().config?.apps?.map?.context || DEFAULT_MAP_CONTEXT,
  );

  mapLayerDisplayTarget = computed(
    () =>
      this.appConfiguration().config?.apps?.record?.mapLayerDisplayTarget ||
      MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  );

  isEmbeddedWmsMapEnabled = computed(
    () => this.mapLayerDisplayTarget() === MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP,
  );

  datasources = computed(() => {
    const record = this.record();
    if (!record) {
      return [];
    }
    return this.duckdbService.getSupportedDatasource(record);
  });

  queryParams = toSignal(this.route.queryParams);

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

  hasWmsCommands = computed(() => this.wmsCommands().length > 0);

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

    // Prevent duplicate entries when a record exposes repeated URLs.
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
    if (this.isEmbeddedWmsMapEnabled() && this.hasWmsCommands()) {
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

    effect(() => {
      const active = this.activeTab();
      const hasCommands = this.hasWmsCommands();
      const enabled = this.isEmbeddedWmsMapEnabled();

      if (active !== 'explore' || !enabled || !hasCommands) {
        return;
      }

      this.ensureViewerReady().then(() => {
        this.addLayersToEmbeddedMap(this.wmsCommands());
      });
    });
  }

  private async ensureViewerReady() {
    if (this.viewer) {
      return;
    }

    const scriptUrl = 'https://sextant.gitlab-pages.ifremer.fr/viewer/sxt-viewer.js';
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = scriptUrl;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });
    }

    await customElements.whenDefined('sxt-viewer');

    this.viewer = this.elementRef.nativeElement.querySelector('sxt-viewer');
    if (this.viewer) {
      this.viewer.setContext(this.mapContext());
    }
  }

  private addLayersToEmbeddedMap(commands: Gn4MapCommand[]) {
    if (!this.viewer) {
      return;
    }

    commands.forEach((cmd) => {
      const layerType = cmd.type || 'wms';
      const layerId = `${layerType}:${cmd.url}#${cmd.name || ''}`;
      if (this.addedLayerIds.has(layerId)) {
        return;
      }

      setTimeout(() => {
        this.viewer.addLayer(
          {
            type: layerType,
            id: layerId,
            url: decodeURIComponent(cmd.url),
            name: decodeURIComponent(cmd.name || ''),
            label: decodeURIComponent(cmd.label || ''),
            visibility: true,
            attributions: '',
          },
          true,
        );
        this.addedLayerIds.add(layerId);
      }, 500);
    });
  }
}
