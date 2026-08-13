import {
  Component,
  SecurityContext,
  ViewChild,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { connect, type GeoLibreEmbedClient } from '@geolibre/embed';
import { FullScreenPanel } from '../../../shared/widgets/full-screen-panel/full-screen-panel';
import { Gn4MapCommand } from '../../record-distributions/map-service';
import { buildGeoLibreLayerSpec, resolveCommandBoundsWgs84 } from '../geolibre-command-utils';

type GeoLibreConfig = {
  embedUrl?: string;
  origin?: string;
  projectUrl?: string;
};

@Component({
  selector: 'app-geolibre-map-panel',
  imports: [FullScreenPanel],
  templateUrl: './geolibre-map-panel.html',
})
export class GeoLibreMapPanel {
  mapContext = input.required<Record<string, unknown>>();
  commands = input<Gn4MapCommand[]>([]);
  focusCommands = input<Gn4MapCommand[]>([]);
  isActive = input<boolean>(true);

  @ViewChild('geolibreIframe') geolibreIframe?: { nativeElement: HTMLIFrameElement };

  private sanitizer = inject(DomSanitizer);

  private client: GeoLibreEmbedClient | null = null;
  private connectedKey: string | null = null;
  private loadedProjectUrl: string | null = null;
  private addedLayerIds = new Set<string>();

  geolibreConfig = computed<GeoLibreConfig>(() => {
    const mapContext = this.mapContext();
    const nested = (mapContext['geolibre'] as GeoLibreConfig | undefined) || {};

    return {
      embedUrl: this.readString(nested.embedUrl) || this.readString(mapContext['embedUrl']) || '',
      origin: this.readString(nested.origin) || this.readString(mapContext['origin']) || '',
      projectUrl:
        this.readString(nested.projectUrl) || this.readString(mapContext['projectUrl']) || '',
    };
  });

  embedUrl = computed(() => {
    const configuredUrl = this.geolibreConfig().embedUrl;
    return configuredUrl || 'https://web.geolibre.app/?embed=1';
  });

  origin = computed(() => {
    const configuredOrigin = this.geolibreConfig().origin;
    if (configuredOrigin) {
      return configuredOrigin;
    }

    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      return new URL(this.embedUrl(), base).origin;
    } catch {
      return '';
    }
  });

  safeUrl = computed<SafeResourceUrl | null>(() => {
    const sanitized = this.sanitizer.sanitize(SecurityContext.URL, this.embedUrl());
    if (!sanitized) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(sanitized);
  });

  constructor() {
    effect(() => {
      const active = this.isActive();
      const safeUrl = this.safeUrl();
      const origin = this.origin();
      const config = this.geolibreConfig();
      const commands = this.commands();
      const focusCommands = this.focusCommands();

      if (!active || !safeUrl || !origin) {
        return;
      }

      void this.syncMap(origin, config, commands, focusCommands);
    });
  }

  private async syncMap(
    origin: string,
    config: GeoLibreConfig,
    commands: Gn4MapCommand[],
    focusCommands: Gn4MapCommand[],
  ) {
    const iframeEl = this.geolibreIframe?.nativeElement;
    if (!iframeEl) {
      return;
    }

    const connectionKey = `${this.embedUrl()}|${origin}`;
    if (!this.client || this.connectedKey !== connectionKey) {
      this.client?.disconnect();
      this.client = await connect(iframeEl, { origin });
      this.connectedKey = connectionKey;
      this.loadedProjectUrl = null;
      this.addedLayerIds.clear();
    }

    const projectUrl = this.resolveProjectUrl(config);
    if (projectUrl && this.loadedProjectUrl !== projectUrl) {
      await this.client.loadProject(projectUrl);
      this.loadedProjectUrl = projectUrl;
      this.addedLayerIds.clear();
    }

    const focusLayerIds = new Set(
      focusCommands.map((cmd) => `${cmd.type || 'wms'}:${cmd.url}#${cmd.name || ''}`),
    );

    let bboxToZoom: [number, number, number, number] | null = null;

    for (const cmd of commands) {
      const layerType = cmd.type || 'wms';
      const layerId = `${layerType}:${cmd.url}#${cmd.name || ''}`;
      if (this.addedLayerIds.has(layerId)) {
        continue;
      }

      const layerBounds = resolveCommandBoundsWgs84(cmd);
      const layerSpec = buildGeoLibreLayerSpec(layerId, cmd, layerBounds);
      await this.client.addLayer(layerSpec);

      if (focusLayerIds.has(layerId)) {
        await this.client.setLayerVisibility(layerSpec.id, true);
      }

      this.addedLayerIds.add(layerId);
      if (!bboxToZoom && layerBounds) {
        bboxToZoom = layerBounds;
      }
    }

    if (bboxToZoom) {
      console.debug('[GeoLibre] Setting view to bbox', bboxToZoom);
      await this.client.setView({ bbox: bboxToZoom });
    } else if (commands.length > 0) {
      console.debug('[GeoLibre] No bbox resolved from commands; skipping setView');
    }
  }

  private readString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private resolveProjectUrl(config: GeoLibreConfig): string {
    return config.projectUrl || '';
  }
}
