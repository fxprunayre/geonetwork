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
import { connect, type AddLayerSpec, type GeoLibreEmbedClient } from '@geolibre/embed';
import {
  APPLICATION_CONFIGURATION,
  buildWmsTileUrl,
  DEFAULT_MAP_CONTEXT,
  DEFAULT_MAP_TYPE,
  ensureSxtViewer,
  extractEndpoint,
  extractWmsLayerName,
  formatBounds,
  Gn4MapCommand,
  MapViewerLike,
  readQueryParam,
  resolveCommandBoundsWgs84,
  SEXTANT_VIEWER_SCRIPT_URL,
} from 'gn-library';

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
  private lastMapType: 'geolibre' | 'geospatialsdk' | null = null;

  constructor() {
    effect(() => {
      const mapType = this.mapType();
      const rawAddCommand = this.queryParams()['add'];

      if (this.lastMapType !== mapType) {
        this.addedGeoLibreLayerIds.clear();

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

        void this.syncGeoLibreMap(origin, config, this.parseCommands(rawAddCommand));
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
      this.geolibreClient = await connect(iframeElement, { origin });
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

    for (const cmd of commands) {
      const layerType = cmd.type || 'wms';
      const layerId = `${layerType}:${cmd.url}#${cmd.name || ''}`;
      if (this.addedGeoLibreLayerIds.has(layerId)) {
        continue;
      }

      const layerBounds = resolveCommandBoundsWgs84(cmd);
      await this.geolibreClient.addLayer(this.toGeoLibreLayerSpec(layerId, cmd, layerBounds));
      this.addedGeoLibreLayerIds.add(layerId);

      if (layerBounds) {
        console.log('[GeoLibre] Setting view to bbox', layerBounds);
        await this.geolibreClient.setView({ bbox: layerBounds });
      } else {
        console.log('[GeoLibre] No bbox resolved for command; skipping setView', {
          layerId,
        });
      }
      break;
    }
  }

  private toGeoLibreLayerSpec(
    layerId: string,
    cmd: Gn4MapCommand,
    boundsWgs84: [number, number, number, number] | null,
  ): AddLayerSpec {
    const layerType = cmd.type || 'wms';
    const url = decodeURIComponent(cmd.url);
    const name = decodeURIComponent(cmd.name || '');
    const label = decodeURIComponent(cmd.label || name || layerId);

    if (layerType === 'wmts') {
      return {
        id: layerId,
        type: 'raster',
        name: label,
        source: {
          type: 'raster',
          tiles: [url],
          tileSize: 256,
        },
        visible: true,
        opacity: 1,
      };
    }

    const wmsLayerName = extractWmsLayerName(url) || name;
    const wmsTilesUrl = buildWmsTileUrl(url, wmsLayerName);
    const wmsEndpoint = extractEndpoint(url);
    const wmsVersion = readQueryParam(url, 'VERSION') || '1.1.1';
    const wmsFormat = readQueryParam(url, 'FORMAT') || 'image/png';
    const wmsTransparent = (readQueryParam(url, 'TRANSPARENT') || 'true').toLowerCase() !== 'false';
    const wmsStyles = readQueryParam(url, 'STYLES') || '';

    return {
      id: layerId,
      type: 'raster',
      name: label,
      source: {
        type: 'raster',
        tiles: [wmsTilesUrl],
        tileSize: 256,
        url: wmsEndpoint,
        layers: wmsLayerName,
        styles: wmsStyles,
        format: wmsFormat,
        transparent: wmsTransparent,
        version: wmsVersion,
        ...(boundsWgs84 ? { bounds: boundsWgs84 } : {}),
      },
      visible: true,
      opacity: 1,
      metadata: {
        service: 'wms',
        layerName: wmsLayerName || name,
        layerType: 'wms',
        ...(boundsWgs84 ? { bounds: boundsWgs84 } : {}),
        ...(boundsWgs84 ? { boundsWgs84: formatBounds(boundsWgs84) } : {}),
      },
    };
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
}
