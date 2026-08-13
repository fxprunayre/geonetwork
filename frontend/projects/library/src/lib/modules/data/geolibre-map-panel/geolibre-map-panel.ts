import {
  Component,
  computed,
  effect,
  inject,
  input,
  SecurityContext,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  connect,
  EMBED_API_SOURCE,
  EMBED_API_VERSION,
  type GeoLibreEmbedClient,
} from '@geolibre/embed';
import { FullScreenPanel } from '../../../shared/widgets/full-screen-panel/full-screen-panel';
import { Gn4MapCommand } from '../../record-distributions/map-service';
import {
  buildGeoLibreLayerSpec,
  hydrateWfsLayerSpecWithGeoJson,
  resolveCommandBoundsWgs84,
} from '../geolibre-command-utils';

type GeoLibreDataClient = GeoLibreEmbedClient & {
  addData: (
    url: string,
    options?: { fit?: boolean; name?: string; format?: string },
  ) => Promise<unknown>;
};

type GeoLibreAddDataOptions = {
  fit?: boolean;
  name?: string;
  format?: string;
};

type GeoLibreConfig = {
  embedUrl?: string;
  origin?: string;
  projectUrl?: string;
};

const GEOLIBRE_CONNECT_TIMEOUT_MS = 45000;
const GEOLIBRE_REQUEST_TIMEOUT_MS = 30000;

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
  private lastDataFallbackKey: string | null = null;

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

      void this.syncMap(origin, config, commands, focusCommands).catch((error: unknown) => {
        console.error('[GeoLibre] panel sync failed', error);
      });
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
      try {
        this.client = await connect(iframeEl, {
          origin,
          timeoutMs: GEOLIBRE_CONNECT_TIMEOUT_MS,
          requestTimeoutMs: GEOLIBRE_REQUEST_TIMEOUT_MS,
        });
      } catch (error) {
        this.client = null;
        this.connectedKey = null;
        console.warn('[GeoLibre] connect handshake failed in panel', error);
        return;
      }
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
    const syncCommands = this.mergeCommands(commands, focusCommands);

    let bboxToZoom: [number, number, number, number] | null = null;

    for (const cmd of syncCommands) {
      const layerType = cmd.type || 'wms';
      if (this.isDataUrlCommand(layerType)) {
        const dataUrl = decodeURIComponent(cmd.url);
        const dataOptions: GeoLibreAddDataOptions = {
          fit: true,
          name: decodeURIComponent(cmd.label || cmd.name || ''),
          format: this.resolveDataFormat(layerType),
        };

        if (this.canAddData(this.client)) {
          await this.client.addData(dataUrl, dataOptions);
          this.addedLayerIds.add(`${layerType}:${cmd.url}#${cmd.name || ''}`);
          this.lastDataFallbackKey = null;
        } else {
          const commandApplied = await this.tryAddDataViaEmbedCommand(
            iframeEl,
            origin,
            dataUrl,
            dataOptions,
          );
          if (commandApplied) {
            this.addedLayerIds.add(`${layerType}:${cmd.url}#${cmd.name || ''}`);
            this.lastDataFallbackKey = null;
            continue;
          }

          const fallbackKey = `${layerType}:${cmd.url}#${cmd.name || ''}`;
          if (this.lastDataFallbackKey !== fallbackKey) {
            console.warn('[GeoLibre] addData bridge unavailable; falling back to iframe data URL', {
              layerType,
            });
            this.lastDataFallbackKey = fallbackKey;
            this.reloadWithDataUrl(iframeEl, cmd, layerType);
          }
          return;
        }
        continue;
      }

      const layerId = `${layerType}:${cmd.url}#${cmd.name || ''}`;
      const layerBounds = resolveCommandBoundsWgs84(cmd);

      if (this.addedLayerIds.has(layerId)) {
        if (focusLayerIds.has(layerId)) {
          await this.client.setLayerVisibility(layerId, true);
        }
        if (!bboxToZoom && layerBounds) {
          bboxToZoom = layerBounds;
        }
        continue;
      }

      const layerSpec = await hydrateWfsLayerSpecWithGeoJson(
        buildGeoLibreLayerSpec(layerId, cmd, layerBounds),
      );
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
    } else if (syncCommands.length > 0) {
      console.debug('[GeoLibre] No bbox resolved from commands; skipping setView');
    }
  }

  private mergeCommands(base: Gn4MapCommand[], focus: Gn4MapCommand[]): Gn4MapCommand[] {
    const merged = [...base, ...focus];
    const seen = new Set<string>();

    return merged.filter((cmd) => {
      const layerType = cmd.type || 'wms';
      const layerId = `${layerType}:${cmd.url}#${cmd.name || ''}`;
      if (seen.has(layerId)) {
        return false;
      }

      seen.add(layerId);
      return true;
    });
  }

  private readString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private resolveProjectUrl(config: GeoLibreConfig): string {
    return config.projectUrl || '';
  }

  private isDataUrlCommand(type: Gn4MapCommand['type']): boolean {
    return type === 'geojson' || type === 'geoparquet' || type === 'cog';
  }

  private resolveDataFormat(type: Gn4MapCommand['type']): string | undefined {
    if (type === 'geoparquet') {
      return 'geoparquet';
    }

    if (type === 'geojson') {
      return 'geojson';
    }

    if (type === 'cog') {
      return 'cog';
    }

    return undefined;
  }

  private reloadWithDataUrl(
    iframeElement: HTMLIFrameElement,
    cmd: Gn4MapCommand,
    layerType: Gn4MapCommand['type'],
  ) {
    const fallbackUrl = this.buildDataUrl(cmd, layerType);

    this.client?.disconnect();
    this.client = null;
    this.connectedKey = null;
    this.loadedProjectUrl = null;
    this.addedLayerIds.clear();

    iframeElement.src = fallbackUrl;
  }

  private buildDataUrl(cmd: Gn4MapCommand, layerType: Gn4MapCommand['type']): string {
    const rawDataUrl = decodeURIComponent(cmd.url);
    const dataName = decodeURIComponent(cmd.label || cmd.name || '');
    const dataFormat = this.resolveDataFormat(layerType);

    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const url = new URL(this.embedUrl(), base);

      url.searchParams.set('data', rawDataUrl);
      if (dataName) {
        url.searchParams.set('dataName', dataName);
      }
      if (dataFormat) {
        url.searchParams.set('dataFormat', dataFormat);
      }
      url.searchParams.set('fit', '1');

      return url.toString();
    } catch {
      return this.embedUrl();
    }
  }

  private canAddData(client: GeoLibreEmbedClient | null): client is GeoLibreDataClient {
    return !!client && typeof (client as { addData?: unknown }).addData === 'function';
  }

  private async tryAddDataViaEmbedCommand(
    iframeElement: HTMLIFrameElement,
    origin: string,
    url: string,
    options: GeoLibreAddDataOptions,
  ): Promise<boolean> {
    const target = iframeElement.contentWindow;
    if (!target) {
      return false;
    }

    const requestId = `host-addData-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return await new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        resolve(false);
      }, 15000);

      const cleanup = () => {
        window.clearTimeout(timeout);
        window.removeEventListener('message', onMessage);
      };

      const onMessage = (event: MessageEvent) => {
        if (event.source !== target || event.origin !== origin) {
          return;
        }

        const data = event.data as
          | {
              source?: string;
              v?: number;
              type?: string;
              payload?: { requestId?: string; ok?: boolean; error?: string };
            }
          | undefined;

        if (!data || data.source !== EMBED_API_SOURCE || data.v !== EMBED_API_VERSION) {
          return;
        }

        if (data.type !== 'ack' || data.payload?.requestId !== requestId) {
          return;
        }

        cleanup();
        if (data.payload.ok === true) {
          resolve(true);
          return;
        }

        console.warn('[GeoLibre] addData command rejected by embed runtime', {
          error: data.payload.error,
        });
        resolve(false);
      };

      window.addEventListener('message', onMessage);

      target.postMessage(
        {
          v: EMBED_API_VERSION,
          type: 'addData',
          payload: { url, options },
          requestId,
        },
        origin,
      );
    });
  }
}
