import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_MAP_CONTEXT,
  DEFAULT_MAP_TYPE,
  ensureSxtViewer,
  GeoLibreMap,
  Gn4MapCommand,
  MapType,
  MapViewerLike,
  SEXTANT_VIEWER_SCRIPT_URL,
} from 'gn-library';

@Component({
  selector: 'app-map',
  imports: [GeoLibreMap],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (mapType() === 'geolibre') {
      <app-geolibre-map
        class="block w-full h-full"
        [mapContext]="mapContext()"
        [focusCommands]="parsedCommands()"
      />
    } @else {
      <sxt-viewer #sxtViewer id="viewer" class="block w-full h-full"></sxt-viewer>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {
  private document = inject(DOCUMENT);
  private elementRef = inject(ElementRef);
  private route = inject(ActivatedRoute);

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

  parsedCommands = computed(() => this.parseCommands(this.queryParams()['add']));

  viewer: MapViewerLike | null = null;
  private lastMapContext: unknown = null;
  private geospatialInitPromise: Promise<void> | null = null;
  private lastMapType: MapType | null = null;

  constructor() {
    effect(() => {
      const mapType = this.mapType();
      const rawAddCommand = this.queryParams()['add'];

      if (this.lastMapType !== mapType) {
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
        return;
      }

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
    if (!this.document.querySelector(`script[src="${SEXTANT_VIEWER_SCRIPT_URL}"]`)) {
      const script = this.document.createElement('script');
      script.type = 'module';
      script.src = SEXTANT_VIEWER_SCRIPT_URL;
      script.crossOrigin = 'anonymous';
      this.document.body.appendChild(script);
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
}
