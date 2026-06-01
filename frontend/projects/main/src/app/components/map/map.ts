import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APPLICATION_CONFIGURATION, DEFAULT_MAP_CONTEXT, Gn4MapCommand } from 'gn-library';
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

  viewer: any;

  ngOnInit() {
    const scriptUrl = 'https://sextant.gitlab-pages.ifremer.fr/viewer/sxt-viewer.js';
    if (!document.querySelector(`script[src="\${scriptUrl}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = scriptUrl;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        this.initMap();
      };
      document.body.appendChild(script);
    }
  }

  async initMap() {
    await customElements.whenDefined('sxt-viewer');
    if (this.viewer) return;

    this.viewer = this.elementRef.nativeElement.querySelector('sxt-viewer');
    if (this.viewer) {
      this.viewer.setContext(this.mapContext());
      this.monitorRoute();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
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
                this.viewer.addLayer(
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
