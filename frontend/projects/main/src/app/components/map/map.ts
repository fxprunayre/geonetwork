import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  template: ` <sxt-viewer class="block w-full h-full"></sxt-viewer> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private route = inject(ActivatedRoute);
  private subs: Subscription = new Subscription();

  ngOnInit() {
    const scriptUrl = 'https://sextant.gitlab-pages.ifremer.fr/viewer/sxt-viewer.js';
    if (!document.querySelector(`script[src="\${scriptUrl}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = scriptUrl;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    }

    this.monitorRoute();
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
            const viewer = this.elementRef.nativeElement.querySelector('sxt-viewer');
            if (viewer) {
              console.log('Adding layers to map viewer', commands);
              // commands.forEach((cmd) => {
              //   viewer.dispatchEvent(new CustomEvent('addLayer', { detail: cmd }));
              // });
            }
          } catch (e) {
            console.warn('Error parsing map commands', e);
          }
        }
      }),
    );
  }
}
