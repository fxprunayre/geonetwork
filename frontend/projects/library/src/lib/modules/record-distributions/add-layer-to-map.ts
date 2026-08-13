import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidDrawPolygon, faSolidExclamation } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Link } from 'gn-api-client';
import { Button } from 'primeng/button';
import { SplitButton } from 'primeng/splitbutton';
import {
  selectMapAppConfiguration,
  selectRecordAppConfiguration,
} from '../config/app-config.selectors';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB, RecordFieldBase } from '../record';
import { MapService } from './map-service';

@Component({
  selector: 'app-add-layer-to-map',
  imports: [Button, NgIcon, SplitButton, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidDrawPolygon,
      faSolidExclamation,
    }),
  ],
  template: `
    @if (status() === 'loading') {
      <p-button
        styleClass="w-full md:w-auto"
        [label]="'record.action.addWms.checking' | translate"
        size="small"
        [fluid]="true"
        [outlined]="true"
        [loading]="true"
        [disabled]="true"
      />
    } @else if (status() === 'error') {
      <p-button
        severity="warn"
        [rounded]="true"
        size="small"
        [title]="'record.action.addWms.unreachable' | translate"
      >
        <ng-icon name="faSolidExclamation" />
      </p-button>
    } @else if (status() === 'not-found') {
      @if (layerList().length > 0) {
        <p-splitbutton
          [label]="'record.action.addWms.addToMap' | translate"
          [title]="
            (linkName() === null
              ? 'record.action.addWms.chooseServiceLayer'
              : 'record.action.addWms.layerNotFoundButChooseAnother'
            ) | translate: { layerName: linkName() }
          "
          [model]="layerList()"
        />
      }
    } @else if (status() === 'found') {
      @if (isWfsMode()) {
        <p-button
          styleClass="w-full md:w-auto"
          [fluid]="true"
          (click)="addLayers([link()], linkName() || undefined)"
          [title]="
            (wfsGeoJsonSupported()
              ? 'record.action.addWms.addToMap'
              : 'record.action.addWms.wfsGeoJsonOnly'
            ) | translate
          "
          [label]="'record.action.addWms.addToMap' | translate"
          size="small"
          [outlined]="true"
          [disabled]="!wfsGeoJsonSupported()"
        >
        </p-button>
      } @else {
        <p-button
          styleClass="w-full md:w-auto"
          [fluid]="true"
          (click)="addLayers([link()], matchingLayersLabel())"
          [title]="
            'record.action.addWms.allLayersFound' | translate: { layerNames: matchingLayersLabel() }
          "
          [label]="'record.action.addWms.addToMap' | translate"
          size="small"
          [outlined]="true"
        />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLayerToMap extends RecordFieldBase {
  link = input.required<Link>();

  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  private mapService = inject(MapService);

  status = signal<'idle' | 'loading' | 'found' | 'not-found' | 'error'>('idle');
  wfsGeoJsonSupported = signal(true);
  private validationRun = 0;

  mapType = computed(() => selectMapAppConfiguration(this.appConfiguration()).type);

  commandType = computed(() =>
    this.mapService.resolveLinkMapCommandType(this.link(), this.mapType()),
  );

  isWfsMode = computed(() => this.commandType() === 'wfs');

  serviceType = computed<'wms' | 'wmts' | 'wfs' | 'geojson' | 'geoparquet' | 'cog' | null>(() =>
    this.commandType(),
  );

  serviceUrl = computed(() => {
    return this.link().urlObject?.['default'] || null;
  });

  linkName = computed(() => {
    return this.link().nameObject?.['default'] || null;
  });

  serviceLayers = signal<{ title?: string; name?: string }[]>([]);

  layerList = computed(() => {
    return this.serviceLayers().map((layer) => ({
      label: layer.title || layer.name,
      command: () => {
        const linkCopy = { ...this.link() };
        linkCopy.nameObject = { default: layer.name || '' };
        this.addLayers([linkCopy], layer.title || layer.name);
      },
    }));
  });

  matchingLayers = signal<{ title?: string; name?: string }[]>([]);

  matchingLayersLabel = computed(() => {
    const matches = this.matchingLayers();
    if (matches.length === 0) {
      return '';
    } else if (matches.length === 1) {
      return matches[0].title || matches[0].name;
    } else {
      return matches.map((layer) => layer.title || layer.name).join(', ');
    }
  });

  mapLayerDisplayTarget = computed(
    () =>
      selectRecordAppConfiguration(this.appConfiguration()).mapLayerDisplayTarget ||
      MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  );

  constructor() {
    super();
    effect(() => {
      const url = this.serviceUrl();
      const serviceType = this.serviceType();
      const runId = ++this.validationRun;

      if (!url || !serviceType) {
        this.status.set('idle');
        this.wfsGeoJsonSupported.set(true);
        return;
      }

      if (serviceType === 'geojson' || serviceType === 'geoparquet' || serviceType === 'cog') {
        this.wfsGeoJsonSupported.set(true);
        this.serviceLayers.set([]);
        this.matchingLayers.set([]);
        this.status.set('found');
        return;
      }

      if (serviceType === 'wfs') {
        this.status.set('loading');
        this.serviceLayers.set([]);
        this.matchingLayers.set([]);

        void this.mapService
          .supportsWfsGeoJsonOutput(this.link())
          .then((supported) => {
            if (runId !== this.validationRun) {
              return;
            }

            this.wfsGeoJsonSupported.set(supported);
            this.status.set('found');
          })
          .catch(() => {
            if (runId !== this.validationRun) {
              return;
            }

            this.wfsGeoJsonSupported.set(false);
            this.status.set('found');
          });

        return;
      }

      this.wfsGeoJsonSupported.set(true);
      this.status.set('loading');

      this.mapService
        .resolveEndpointLayers(this.link())
        .then((layers) => {
          this.serviceLayers.set((layers || []) as { title?: string; name?: string }[]);

          if (!layers) {
            this.status.set('not-found');
            return;
          }

          const matches = this.mapService.matchRequestedLayers(layers, this.linkName());
          this.matchingLayers.set((matches || []) as { title?: string; name?: string }[]);
          this.status.set(matches === null ? 'not-found' : 'found');
        })
        .catch((e: unknown) => {
          console.error(e);
          this.status.set('error');
        });
    });
  }

  addLayers = (links: Link[], label?: string) => {
    const serviceType = this.serviceType();
    if (!serviceType) {
      return;
    }

    const command = this.mapService.buildMapCommands(
      links,
      this.record().uuid,
      serviceType,
      label ? [label] : undefined,
    );

    this.mapService.navigateToMap(command, this.record().uuid, this.mapLayerDisplayTarget());
  };
}
