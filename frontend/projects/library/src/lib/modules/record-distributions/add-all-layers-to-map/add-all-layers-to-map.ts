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
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB } from '../../config/gn-constants';
import { RecordFieldBase } from '../../record/record-field-base/record-field-base';
import { MapService } from '../map-service';

@Component({
  selector: 'app-add-all-layers-to-map',
  imports: [Button, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidExclamation,
    }),
  ],
  template: `
    @if (status() === 'loading') {
      <p-button
        styleClass="w-full md:w-auto"
        [label]="'record.action.addWms.addAllToMap' | translate"
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
    } @else if (status() === 'found') {
      <p-button
        styleClass="w-full md:w-auto"
        (click)="addWmsLayers(validLinks(), matchingLayersLabel())"
        [title]="
          'record.action.addWms.allLayersFound' | translate: { layerNames: matchingLayersLabel() }
        "
        [label]="'record.action.addWms.addAllToMap' | translate"
        size="small"
        [outlined]="true"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAllLayersToMap extends RecordFieldBase {
  links = input.required<Link[]>();

  private appConfiguration = inject(APPLICATION_CONFIGURATION);
  private mapService = inject(MapService);

  status = signal<'idle' | 'loading' | 'found' | 'error'>('idle');
  validLinks = signal<Link[]>([]);
  matchedLayers = signal<string[]>([]);

  mapLayerDisplayTarget = computed(
    () =>
      this.appConfiguration().config?.apps?.record?.mapLayerDisplayTarget ||
      MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  );

  matchingLayersLabel = computed(() => this.matchedLayers().join(', '));

  private validationRun = 0;

  constructor() {
    super();

    effect(() => {
      const links = this.links();
      const runId = ++this.validationRun;

      if (!this.mapService.hasBulkWmsLinks(links)) {
        this.validLinks.set([]);
        this.matchedLayers.set([]);
        this.status.set('idle');
        return;
      }

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
        this.status.set('idle');
        return;
      }

      this.validLinks.set(validation.validLinks);
      this.matchedLayers.set(validation.matchedLayerLabels);
      this.status.set('found');
    } catch (e) {
      console.error(e);

      if (runId === this.validationRun) {
        this.validLinks.set([]);
        this.matchedLayers.set([]);
        this.status.set('error');
      }
    }
  }

  addWmsLayers = (links: Link[], label?: string) => {
    const command = this.mapService.buildMapCommands(links, this.record().uuid, 'wms', label);

    this.mapService.navigateToMap(command, this.record().uuid, this.mapLayerDisplayTarget());
  };
}
