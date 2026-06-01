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
import { faSolidExclamation } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Link } from 'gn-api-client';
import { Button } from 'primeng/button';
import { SplitButton } from 'primeng/splitbutton';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RecordFieldBase } from '../../record/record-field-base/record-field-base';
import { MapService } from '../map-service';

@Component({
  selector: 'app-add-layer-to-map',
  imports: [Button, NgIcon, SplitButton, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidExclamation,
    }),
  ],
  template: `
    @if (status() === 'loading') {
      <p-button
        styleClass="w-full md:w-auto"
        [label]="'record.action.addWms.checking' | translate"
        size="small"
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

  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  private mapService = inject(MapService);

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

      if (!url) {
        this.status.set('idle');
        return;
      }

      this.status.set('loading');

      this.mapService
        .resolveEndpointLayers(this.link())
        .then((layers) => {
          this.serviceLayers.set(layers || []);

          if (!layers) {
            this.status.set('not-found');
            return;
          }

          const matches = this.mapService.matchRequestedLayers(layers, this.linkName());
          this.matchingLayers.set(matches || []);
          this.status.set(matches === null ? 'not-found' : 'found');
        })
        .catch((e: any) => {
          console.error(e);
          this.status.set('error');
        });
    });
  }

  addWmsLayers = (links: Link[], label?: string) => {
    const command = this.mapService.buildMapCommands(
      links,
      this.record().uuid,
      this.serviceType(),
      label,
    );

    this.mapService.navigateToMap(command, this.record().uuid, this.mapLayerDisplayTarget());
  };
}
