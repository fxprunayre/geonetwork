import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
  ElementRef,
  computed,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { APPLICATION_CONFIGURATION, DEFAULT_MAP_CONTEXT } from 'gn-library';
import { Subscription } from 'rxjs';

interface Gn4MapCommand {
  uuid?: string;
  url: string;
  name?: string;
}

@Component({
  selector: 'app-map',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: ` <sxt-viewer id="viewer" class="block w-full h-full"></sxt-viewer> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
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
      document.body.appendChild(script);
    }
  }

  async ngAfterViewInit() {
    await customElements.whenDefined('sxt-viewer');
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
              console.log('Adding layers to map viewer', commands);
              commands.forEach((cmd) => {
                this.viewer.addLayer({
                  type: 'wms',
                  id: cmd.url + '_' + cmd.name,
                  url: cmd.url,
                  name: cmd.name,
                  label: cmd.name,
                  visibility: true,
                  attributions: '',
                });
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
