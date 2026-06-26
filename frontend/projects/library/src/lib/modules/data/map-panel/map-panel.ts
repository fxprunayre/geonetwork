import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { FullScreenPanel } from '../../../shared/widgets/full-screen-panel/full-screen-panel';
import { Gn4MapCommand } from '../../record-distributions/map-service';

@Component({
  selector: 'app-map-panel',
  imports: [FullScreenPanel],
  templateUrl: './map-panel.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapPanel {
  mapContext = input.required<Record<string, unknown>>();
  commands = input<Gn4MapCommand[]>([]);
  focusCommands = input<Gn4MapCommand[]>([]);
  isActive = input<boolean>(true);

  private elementRef = inject(ElementRef);

  private viewer: {
    setContext: (ctx: Record<string, unknown>) => void;
    addLayer: (layer: Record<string, unknown>, focus: boolean) => void;
  } | null = null;
  private addedLayerIds = new Set<string>();

  constructor() {
    effect(() => {
      const active = this.isActive();
      const commands = this.commands();
      this.focusCommands();
      this.mapContext();

      if (!active || commands.length === 0) {
        return;
      }

      this.ensureViewerReady().then(() => {
        this.addLayersToEmbeddedMap(this.commands(), this.focusCommands());
      });
    });
  }

  private async ensureViewerReady() {
    if (this.viewer) {
      return;
    }

    const scriptUrl = 'https://sextant.gitlab-pages.ifremer.fr/viewer/sxt-viewer.js';
    if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = scriptUrl;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });
    }

    await customElements.whenDefined('sxt-viewer');

    this.viewer = this.elementRef.nativeElement.querySelector('sxt-viewer');
    if (this.viewer) {
      this.viewer.setContext(this.mapContext());
    }
  }

  private addLayersToEmbeddedMap(commands: Gn4MapCommand[], focusCommands: Gn4MapCommand[]) {
    if (!this.viewer) {
      return;
    }

    // Rebuild the layer stack when query params change so focus/zoom can be reapplied.
    this.addedLayerIds.clear();

    const focusLayerIds = new Set(
      focusCommands.map((cmd) => `${cmd.type || 'wms'}:${cmd.url}#${cmd.name || ''}`),
    );
    let focusApplied = false;

    commands.forEach((cmd) => {
      const layerType = cmd.type || 'wms';
      const layerId = `${layerType}:${cmd.url}#${cmd.name || ''}`;
      if (this.addedLayerIds.has(layerId)) {
        return;
      }

      const shouldFocus = !focusApplied && focusLayerIds.has(layerId);
      if (shouldFocus) {
        focusApplied = true;
      }

      setTimeout(() => {
        this.viewer?.addLayer(
          {
            type: layerType,
            id: layerId,
            url: decodeURIComponent(cmd.url),
            name: decodeURIComponent(cmd.name || ''),
            label: decodeURIComponent(cmd.label || ''),
            visibility: true,
            attributions: '',
          },
          shouldFocus,
        );
        this.addedLayerIds.add(layerId);
      }, 500);
    });
  }
}
