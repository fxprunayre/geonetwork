import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  APPLICATION_CONFIGURATION,
  DEFAULT_MAP_CONTEXT,
  Gn4MapCommand,
  MapViewerLike,
  SEXTANT_VIEWER_SCRIPT_URL,
  ensureSxtViewer,
} from 'gn-library';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: ` <sxt-viewer id="viewer" class="block w-full h-full"></sxt-viewer> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private route = inject(ActivatedRoute);
  private subs: Subscription = new Subscription();

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  mapContext = computed(
    () => this.appConfiguration().config?.apps?.map?.context || DEFAULT_MAP_CONTEXT,
  );

  viewer: MapViewerLike | null = null;
  private lastMapContext: unknown = null;

  constructor() {
    effect(() => {
      this.mapContext();
      this.applyMapContext();
    });
  }

  ngOnInit() {
    if (!document.querySelector(`script[src="${SEXTANT_VIEWER_SCRIPT_URL}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = SEXTANT_VIEWER_SCRIPT_URL;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        this.initMap();
      };
      document.body.appendChild(script);
    } else {
      this.initMap();
    }
  }

  async initMap() {
    this.viewer = await ensureSxtViewer(
      SEXTANT_VIEWER_SCRIPT_URL,
      this.elementRef.nativeElement as HTMLElement,
    );
    if (this.viewer) {
      this.applyMapContext();
      this.monitorRoute();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private applyMapContext() {
    const context = this.mapContext();
    if (this.viewer && this.lastMapContext !== context) {
      this.viewer.setContext(context);
      this.lastMapContext = context;
    }
  }

  private monitorRoute() {
    this.subs.add(
      this.route.queryParams.subscribe((params) => {
        if (params['add']) {
          try {
            const commands = JSON.parse(params['add']) as Gn4MapCommand[];
            if (this.viewer) {
              commands.forEach((cmd) => {
                const layerType = cmd.type || 'wms';
                this.viewer!.addLayer(
                  {
                    type: layerType,
                    id: layerType + ':' + cmd.url + '#' + cmd.name,
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
          } catch (e) {
            console.warn('Error parsing map commands', e);
          }
        }
      }),
    );
  }
}
