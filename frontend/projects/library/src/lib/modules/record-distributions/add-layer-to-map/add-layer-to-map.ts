import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { WmsEndpoint, WmtsEndpoint } from '@camptocamp/ogc-client';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidExclamation } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Link } from 'gn-api-client';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { SplitButton } from 'primeng/splitbutton';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordFieldBase } from '../../record/record-field-base/record-field-base';
import { MAP_ROUTE_PATH, RECORD_ROUTE_PATH } from '../../search/search-constant';

export interface Gn4MapCommand {
  type?: 'wms' | 'wmts';
  uuid?: string;
  url: string;
  name?: string;
  label?: string;
}

@Component({
  selector: 'app-add-layer-to-map',
  imports: [Button, NgIcon, Skeleton, SplitButton, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidExclamation,
    }),
  ],
  template: `
    @if (status() === 'loading') {
      <p-skeleton [title]="'record.action.addWms.checking' | translate" size="2rem" class="mr-2" />
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
      <p-button
        styleClass="w-full md:w-auto"
        (click)="addWmsLayers([link()], matchingLayersLabel())"
        [title]="
          'record.action.addWms.allLayersFound' | translate: { layerNames: matchingLayersLabel() }
        "
        [label]="'record.action.addWms.addToMap' | translate"
        size="small"
        [outlined]="true"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLayerToMap extends RecordFieldBase {
  link = input.required<Link>();

  private router = inject(Router);
  private appConfiguration = inject(APPLICATION_CONFIGURATION);

  status = signal<'idle' | 'loading' | 'found' | 'not-found' | 'error'>('idle');

  serviceType = computed<'wms' | 'wmts'>(() => {
    const protocol = this.link().protocol || '';
    return protocol.includes('OGC:WMTS') ? 'wmts' : 'wms';
  });

  serviceUrl = computed(() => {
    return this.link().urlObject?.['default'] || null;
  });

  linkName = computed(() => {
    return this.link().nameObject?.['default'] || null;
  });

  serviceLayers = signal<any[]>([]);

  layerList = computed(() => {
    return this.serviceLayers().map((layer) => ({
      label: layer.title || layer.name,
      command: () => {
        const linkCopy = { ...this.link() };
        linkCopy.nameObject = { default: layer.name };
        this.addWmsLayers([linkCopy], layer.title || layer.name);
      },
    }));
  });

  matchingLayers = signal<any[]>([]);

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
    () => this.appConfiguration().config?.apps?.record?.mapLayerDisplayTarget || 'main-map-tab',
  );

  constructor() {
    super();
    effect(() => {
      const url = this.serviceUrl();
      const layerName = this.linkName();
      const serviceType = this.serviceType();

      if (!url) {
        this.status.set('idle');
        return;
      }

      this.status.set('loading');

      const endpoint = serviceType === 'wmts' ? new WmtsEndpoint(url) : new WmsEndpoint(url);

      endpoint
        .isReady()
        .then((endpoint: any) => {
          const layers =
            serviceType === 'wmts' ? endpoint.getLayers() : endpoint.getFlattenedLayers();
          this.serviceLayers.set(layers);

          if (!layers) {
            this.status.set('not-found');
            return;
          }

          if (!layerName) {
            this.status.set('not-found');
            return;
          }

          const layerNames = layerName.split(',');
          // Layer name is mandatory to execute isReady
          const matches = layers.filter((layer: any) => layerNames.includes(layer.name));
          this.matchingLayers.set(matches);

          const allFound = layerNames.every((name: string) =>
            matches.some((layer: any) => layer.name === name),
          );

          this.status.set(allFound ? 'found' : 'not-found');
        })
        .catch((e: any) => {
          console.error(e);
          this.status.set('error');
        });
    });
  }

  addWmsLayers = (links: Link[], label?: string) => {
    const command = links
      .filter((link) => link.urlObject)
      .map((link) => {
        const cmd: Gn4MapCommand = {
          type: this.serviceType(),
          url: encodeURIComponent(link.urlObject!['default']),
          uuid: this.record().uuid,
        };
        if (link.nameObject) {
          cmd.name = encodeURIComponent(link.nameObject['default']);
        }
        cmd.label = encodeURIComponent(label || cmd.name || '');
        return cmd;
      });
    if (command.length > 0) {
      if (this.mapLayerDisplayTarget() === 'explore-embedded-map') {
        this.router.navigate([RECORD_ROUTE_PATH, this.record().uuid, 'explore'], {
          queryParams: { wmsAdd: JSON.stringify(command) },
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate([MAP_ROUTE_PATH], {
          queryParams: { add: JSON.stringify(command) },
        });
      }
      // const commandParameter = 'add=' + JSON.stringify(command);

      //   window.open(
      //     `https://sextant.ifremer.fr/geonetwork/srv/fre/catalog.search#/map?${commandParameter}`,
      //     'map',
      //   );
    }
  };
}
