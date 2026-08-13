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
import {
  selectMapAppConfiguration,
  selectRecordAppConfiguration,
} from '../config/app-config.selectors';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB, RecordFieldBase } from '../record';
import { MapService } from './map-service';

@Component({
  selector: 'app-add-all-layers-to-map',
  imports: [Button, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidDrawPolygon,
      faSolidExclamation,
    }),
  ],
  template: `
    @if (status() === 'loading') {
      <p-button
        data-testid="add-all-layers-to-map-button"
        styleClass="w-full md:w-auto"
        [label]="'record.action.addWms.addAllToMap' | translate"
        size="small"
        [outlined]="true"
        [loading]="true"
        [disabled]="true"
      />
    } @else if (status() === 'error') {
      <p-button
        data-testid="add-all-layers-to-map-button"
        severity="warn"
        [rounded]="true"
        size="small"
        [title]="'record.action.addWms.unreachable' | translate"
      >
        <ng-icon name="faSolidExclamation" />
      </p-button>
    } @else if (status() === 'found') {
      @if (serviceType() === 'wfs') {
        <p-button
          data-testid="add-all-layers-to-map-button"
          styleClass="w-full md:w-auto"
          (click)="addLayers(validLinks())"
          [title]="
            (wfsGeoJsonSupported()
              ? 'record.action.addWms.addAllToMap'
              : 'record.action.addWms.wfsGeoJsonOnly'
            ) | translate
          "
          size="small"
          [outlined]="true"
          [disabled]="!wfsGeoJsonSupported()"
        >
          <ng-icon name="faSolidDrawPolygon" />
        </p-button>
      } @else {
        <p-button
          data-testid="add-all-layers-to-map-button"
          styleClass="w-full md:w-auto"
          (click)="addLayers(validLinks())"
          [title]="
            'record.action.addWms.allLayersFound' | translate: { layerNames: matchingLayersLabel() }
          "
          [label]="'record.action.addWms.addAllToMap' | translate"
          size="small"
          [outlined]="true"
        />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAllLayersToMap extends RecordFieldBase {
  links = input.required<Link[]>();

  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  private mapService = inject(MapService);

  status = signal<'idle' | 'loading' | 'found' | 'error'>('idle');
  wfsGeoJsonSupported = signal(true);
  validLinks = signal<Link[]>([]);
  matchedLayers = signal<string[]>([]);
  boundsByLinkKey = signal<Record<string, [number, number, number, number]>>({});
  mapType = computed(() => selectMapAppConfiguration(this.appConfiguration()).type);

  serviceType = computed<'wms' | 'wfs' | null>(() => {
    const links = this.links();

    if (this.mapService.hasBulkWmsLinks(links)) {
      return 'wms';
    }

    if (this.mapType() === 'geolibre' && this.mapService.hasBulkWfsLinks(links)) {
      return 'wfs';
    }

    return null;
  });

  mapLayerDisplayTarget = computed(
    () =>
      selectRecordAppConfiguration(this.appConfiguration()).mapLayerDisplayTarget ||
      MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  );

  matchingLayersLabel = computed(() => this.matchedLayers().join(', '));

  private validationRun = 0;

  constructor() {
    super();

    effect(() => {
      const links = this.links();
      const serviceType = this.serviceType();
      const runId = ++this.validationRun;

      if (!serviceType) {
        this.wfsGeoJsonSupported.set(true);
        this.validLinks.set([]);
        this.matchedLayers.set([]);
        this.boundsByLinkKey.set({});
        this.status.set('idle');
        return;
      }

      if (serviceType === 'wfs') {
        this.status.set('loading');

        void this.mapService
          .validateBulkWfsLinks(links)
          .then((validation) => {
            if (runId !== this.validationRun) {
              return;
            }

            if (!validation) {
              this.validLinks.set([]);
              this.matchedLayers.set([]);
              this.boundsByLinkKey.set({});
              this.status.set('idle');
              return;
            }

            this.validLinks.set(validation.validLinks);
            this.matchedLayers.set(validation.matchedLayerLabels);
            this.boundsByLinkKey.set({});
            void Promise.all(
              validation.validLinks.map((link) => this.mapService.supportsWfsGeoJsonOutput(link)),
            )
              .then((supportedFlags) => {
                if (runId !== this.validationRun) {
                  return;
                }

                this.wfsGeoJsonSupported.set(supportedFlags.every(Boolean));
              })
              .catch(() => {
                if (runId !== this.validationRun) {
                  return;
                }

                this.wfsGeoJsonSupported.set(false);
              });
            this.status.set('found');
          })
          .catch((e) => {
            console.error(e);

            if (runId === this.validationRun) {
              this.validLinks.set([]);
              this.matchedLayers.set([]);
              this.boundsByLinkKey.set({});
              this.status.set('error');
            }
          });

        return;
      }

      this.wfsGeoJsonSupported.set(true);
      this.status.set('loading');

      void this.checkAllLinks(runId, links);
    });
  }

  private async checkAllLinks(runId: number, links: Link[]): Promise<void> {
    try {
      const validation = await this.mapService.validateBulkWmsLinks(links);

      if (runId !== this.validationRun) {
        return;
      }

      if (!validation) {
        this.validLinks.set([]);
        this.matchedLayers.set([]);
        this.boundsByLinkKey.set({});
        this.status.set('idle');
        return;
      }

      this.validLinks.set(validation.validLinks);
      this.matchedLayers.set(validation.matchedLayerLabels);
      this.boundsByLinkKey.set(validation.boundsByLinkKey);
      this.status.set('found');
    } catch (e) {
      console.error(e);

      if (runId === this.validationRun) {
        this.validLinks.set([]);
        this.matchedLayers.set([]);
        this.boundsByLinkKey.set({});
        this.status.set('error');
      }
    }
  }

  addLayers = (links: Link[]) => {
    const serviceType = this.serviceType();
    if (!serviceType) {
      return;
    }

    const command = this.mapService.buildMapCommands(
      links,
      this.record().uuid,
      serviceType,
      this.matchedLayers(),
      this.boundsByLinkKey(),
    );

    this.mapService.navigateToMap(command, this.record().uuid, this.mapLayerDisplayTarget());
  };
}
