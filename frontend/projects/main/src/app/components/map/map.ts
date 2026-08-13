import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  SecurityContext,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  connect,
  EMBED_API_SOURCE,
  EMBED_API_VERSION,
  type GeoLibreEmbedClient,
} from '@geolibre/embed';
import {
  APPLICATION_CONFIGURATION,
  buildGeoLibreLayerSpec,
  DEFAULT_MAP_CONTEXT,
  DEFAULT_MAP_TYPE,
  ensureSxtViewer,
  Gn4MapCommand,
  hydrateWfsLayerSpecWithGeoJson,
  MapViewerLike,
  resolveCommandBoundsWgs84,
  SEXTANT_VIEWER_SCRIPT_URL,
} from 'gn-library';

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

const GEOLIBRE_CONNECT_TIMEOUT_MS = 45000;
const GEOLIBRE_REQUEST_TIMEOUT_MS = 30000;

@Component({
  selector: 'app-map',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (mapType() === 'geolibre') {
      @if (safeGeoLibreUrl()) {
        <iframe
          #geolibreIframe
          class="block w-full h-full"
          [src]="safeGeoLibreUrl()"
          title="GeoLibre viewer"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        ></iframe>
      } @else {
        <div class="p-3 text-sm text-surface-600 dark:text-surface-400">Invalid GeoLibre URL.</div>
      }
    } @else {
      <sxt-viewer #sxtViewer id="viewer" class="block w-full h-full"></sxt-viewer>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnDestroy {
  private elementRef = inject(ElementRef);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  geolibreIframe = viewChild<ElementRef<HTMLIFrameElement>>('geolibreIframe');
  sxtViewer = viewChild<ElementRef<HTMLElement>>('sxtViewer');

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  queryParams = toSignal(this.route.queryParams, {
    initialValue: {} as Record<string, string | undefined>,
  });

  mapApp = computed(() => this.appConfiguration().config?.apps?.map);

  mapType = computed(() => this.mapApp()?.type ?? DEFAULT_MAP_TYPE);

  mapContext = computed(() => {
    const mapApp = this.mapApp();
    if (!mapApp) {
      return DEFAULT_MAP_CONTEXT;
    }

    if (this.mapType() === 'geolibre') {
      return {
        geolibre: {
          ...(mapApp.geolibre || {}),
        },
      };
    }

    return mapApp.geospatialsdk?.context || DEFAULT_MAP_CONTEXT;
  });

  geolibreConfig = computed(() => {
    const mapContext = this.mapContext() as Record<string, unknown>;
    const nested = (mapContext['geolibre'] as Record<string, unknown> | undefined) || {};

    return {
      embedUrl:
        this.readString(nested['embedUrl']) || this.readString(mapContext['embedUrl']) || '',
      origin: this.readString(nested['origin']) || this.readString(mapContext['origin']) || '',
      projectUrl:
        this.readString(nested['projectUrl']) || this.readString(mapContext['projectUrl']) || '',
    };
  });

  geolibreEmbedUrl = computed(
    () => this.geolibreConfig().embedUrl || 'https://web.geolibre.app/?embed=1',
  );

  geolibreOrigin = computed(() => {
    const configuredOrigin = this.geolibreConfig().origin;
    if (configuredOrigin) {
      return configuredOrigin;
    }

    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      return new URL(this.geolibreEmbedUrl(), base).origin;
    } catch {
      return '';
    }
  });

  safeGeoLibreUrl = computed<SafeResourceUrl | null>(() => {
    const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, this.geolibreEmbedUrl());
    if (!sanitizedUrl) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(sanitizedUrl);
  });

  viewer: MapViewerLike | null = null;
  geolibreClient: GeoLibreEmbedClient | null = null;
  private lastMapContext: unknown = null;
  private geospatialInitPromise: Promise<void> | null = null;
  private connectedGeoLibreKey: string | null = null;
  private loadedGeoLibreProjectUrl: string | null = null;
  private addedGeoLibreLayerIds = new Set<string>();
  private lastGeoLibreDataFallbackKey: string | null = null;
  private lastMapType: 'geolibre' | 'geospatialsdk' | null = null;

  constructor() {
    effect(() => {
      const mapType = this.mapType();
      const rawAddCommand = this.queryParams()['add'];

      if (this.lastMapType !== mapType) {
        this.addedGeoLibreLayerIds.clear();
        this.lastGeoLibreDataFallbackKey = null;

        if (mapType === 'geolibre') {
          // The geospatial viewer element is removed from DOM in geolibre mode.
          // Drop references so we rebind to a fresh <sxt-viewer> when switching back.
          this.viewer = null;
          this.geospatialInitPromise = null;
          this.lastMapContext = null;
        }
      }
      this.lastMapType = mapType;

      if (mapType === 'geolibre') {
        const iframeRef = this.geolibreIframe();
        const safeUrl = this.safeGeoLibreUrl();
        const origin = this.geolibreOrigin();
        const config = this.geolibreConfig();

        if (!iframeRef || !safeUrl || !origin) {
          return;
        }

        void this.syncGeoLibreMap(origin, config, this.parseCommands(rawAddCommand)).catch(
          (error: unknown) => {
            console.error('[GeoLibre] map sync failed', error);
          },
        );
        return;
      }

      this.geolibreClient?.disconnect();
      this.geolibreClient = null;
      this.connectedGeoLibreKey = null;
      this.loadedGeoLibreProjectUrl = null;

      const sxtViewerRef = this.sxtViewer();
      if (!sxtViewerRef) {
        return;
      }

      void this.ensureGeospatialSdkMapReady().then(() => {
        this.applyMapContext();
        this.applyGeospatialCommands(rawAddCommand);
      });
    });
  }

  ngOnDestroy() {
    this.geolibreClient?.disconnect();
  }

  private async ensureGeospatialSdkMapReady() {
    if (this.viewer) {
      return;
    }

    if (!this.geospatialInitPromise) {
      this.geospatialInitPromise = this.initGeospatialSdkMap();
    }

    await this.geospatialInitPromise;
  }

  private async initGeospatialSdkMap() {
    if (!document.querySelector(`script[src="${SEXTANT_VIEWER_SCRIPT_URL}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = SEXTANT_VIEWER_SCRIPT_URL;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });
    }

    this.viewer = await ensureSxtViewer(
      SEXTANT_VIEWER_SCRIPT_URL,
      this.elementRef.nativeElement as HTMLElement,
    );

    if (!this.viewer) {
      // If the view was not ready yet, allow a later retry when view signals update.
      this.geospatialInitPromise = null;
    }
  }

  private applyMapContext() {
    const context = this.mapContext();
    if (this.viewer && this.lastMapContext !== context) {
      this.viewer.setContext(context);
      this.lastMapContext = context;
    }
  }

  private applyGeospatialCommands(rawCommands: string | undefined) {
    if (!this.viewer || !rawCommands) {
      return;
    }

    const commands = this.parseCommands(rawCommands);
    commands.forEach((cmd) => {
      const layerType = cmd.type || 'wms';
      this.viewer?.addLayer(
        {
          type: layerType,
          id: `${layerType}:${cmd.url}#${cmd.name || ''}`,
          url: decodeURIComponent(cmd.url),
          name: decodeURIComponent(cmd.name || ''),
          label: decodeURIComponent(cmd.label || ''),
          visibility: true,
          attributions: '',
        },
        true,
      );
    });
  }

  private async syncGeoLibreMap(
    origin: string,
    config: { projectUrl?: string },
    commands: Gn4MapCommand[],
  ) {
    const iframeElement = this.geolibreIframe()?.nativeElement;
    if (!iframeElement) {
      return;
    }

    const connectionKey = `${this.geolibreEmbedUrl()}|${origin}`;
    if (!this.geolibreClient || this.connectedGeoLibreKey !== connectionKey) {
      this.geolibreClient?.disconnect();
      try {
        this.geolibreClient = await connect(iframeElement, {
          origin,
          timeoutMs: GEOLIBRE_CONNECT_TIMEOUT_MS,
          requestTimeoutMs: GEOLIBRE_REQUEST_TIMEOUT_MS,
        });
      } catch (error) {
        this.geolibreClient = null;
        this.connectedGeoLibreKey = null;
        console.warn('[GeoLibre] connect handshake failed', error);
        return;
      }
      this.connectedGeoLibreKey = connectionKey;
      this.loadedGeoLibreProjectUrl = null;
      this.addedGeoLibreLayerIds.clear();
    }

    const projectUrl = this.resolveProjectUrl(config);
    if (projectUrl && this.loadedGeoLibreProjectUrl !== projectUrl) {
      await this.geolibreClient.loadProject(projectUrl);
      this.loadedGeoLibreProjectUrl = projectUrl;
      this.addedGeoLibreLayerIds.clear();
    }

    let bboxToZoom: [number, number, number, number] | null = null;

    for (const cmd of commands) {
      const layerType = cmd.type || 'wms';
      if (this.isDataUrlCommand(layerType)) {
        const dataUrl = decodeURIComponent(cmd.url);
        const dataOptions: GeoLibreAddDataOptions = {
          fit: true,
          name: decodeURIComponent(cmd.label || cmd.name || ''),
          format: this.resolveDataFormat(layerType),
        };

        if (this.canAddData(this.geolibreClient)) {
          await this.geolibreClient.addData(dataUrl, dataOptions);
          this.addedGeoLibreLayerIds.add(`${layerType}:${cmd.url}#${cmd.name || ''}`);
          this.lastGeoLibreDataFallbackKey = null;
        } else {
          const commandApplied = await this.tryAddDataViaEmbedCommand(
            iframeElement,
            origin,
            dataUrl,
            dataOptions,
          );
          if (commandApplied) {
            this.addedGeoLibreLayerIds.add(`${layerType}:${cmd.url}#${cmd.name || ''}`);
            this.lastGeoLibreDataFallbackKey = null;
            continue;
          }

          const fallbackKey = `${layerType}:${cmd.url}#${cmd.name || ''}`;
          if (this.lastGeoLibreDataFallbackKey !== fallbackKey) {
            console.warn('[GeoLibre] addData bridge unavailable; falling back to iframe data URL', {
              layerType,
            });
            this.lastGeoLibreDataFallbackKey = fallbackKey;
            this.reloadGeoLibreWithDataUrl(iframeElement, cmd, layerType);
          }
          return;
        }
        continue;
      }

      const layerId = `${layerType}:${cmd.url}#${cmd.name || ''}`;
      const layerBounds = resolveCommandBoundsWgs84(cmd);

      if (this.addedGeoLibreLayerIds.has(layerId)) {
        if (!bboxToZoom && layerBounds) {
          bboxToZoom = layerBounds;
        }
        continue;
      }

      const layerSpec = await hydrateWfsLayerSpecWithGeoJson(
        buildGeoLibreLayerSpec(layerId, cmd, layerBounds),
      );
      await this.geolibreClient.addLayer(layerSpec);
      this.addedGeoLibreLayerIds.add(layerId);

      if (!bboxToZoom && layerBounds) {
        bboxToZoom = layerBounds;
      }
    }

    if (bboxToZoom) {
      console.log('[GeoLibre] Setting view to bbox', bboxToZoom);
      await this.geolibreClient.setView({ bbox: bboxToZoom });
    } else if (commands.length > 0) {
      console.log('[GeoLibre] No bbox resolved for command; skipping setView');
    }
  }

  private parseCommands(rawCommands: string | undefined): Gn4MapCommand[] {
    if (!rawCommands) {
      return [];
    }

    try {
      return JSON.parse(rawCommands) as Gn4MapCommand[];
    } catch (e) {
      console.warn('Error parsing map commands', e);
      return [];
    }
  }

  private readString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private resolveProjectUrl(config: { projectUrl?: string }): string {
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

  private reloadGeoLibreWithDataUrl(
    iframeElement: HTMLIFrameElement,
    cmd: Gn4MapCommand,
    layerType: Gn4MapCommand['type'],
  ) {
    const fallbackUrl = this.buildGeoLibreDataUrl(cmd, layerType);

    this.geolibreClient?.disconnect();
    this.geolibreClient = null;
    this.connectedGeoLibreKey = null;
    this.loadedGeoLibreProjectUrl = null;
    this.addedGeoLibreLayerIds.clear();

    iframeElement.src = fallbackUrl;
  }

  private buildGeoLibreDataUrl(cmd: Gn4MapCommand, layerType: Gn4MapCommand['type']): string {
    const rawDataUrl = decodeURIComponent(cmd.url);
    const dataName = decodeURIComponent(cmd.label || cmd.name || '');
    const dataFormat = this.resolveDataFormat(layerType);

    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const url = new URL(this.geolibreEmbedUrl(), base);

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
      return this.geolibreEmbedUrl();
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
