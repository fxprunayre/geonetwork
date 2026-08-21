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
import { SEXTANT_VIEWER_SCRIPT_URL, ensureSxtViewer, type MapViewerLike } from '../map-utils';

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

  private viewer: MapViewerLike | null = null;
  private addedLayerIds = new Set<string>();
  private lastMapContext: Record<string, unknown> | null = null;

  constructor() {
    effect(() => {
      const active = this.isActive();
      const commands = this.commands();
      const mapContext = this.mapContext();
      this.focusCommands();

      if (!active || commands.length === 0) {
        return;
      }

      this.ensureViewerReady().then(() => {
        if (this.viewer && this.lastMapContext !== mapContext) {
          this.viewer.setContext(mapContext);
          this.lastMapContext = mapContext;
        }

        this.addLayersToEmbeddedMap(this.commands(), this.focusCommands());
      });
    });
  }

  private async ensureViewerReady() {
    if (this.viewer) {
      return;
    }

    this.viewer = await ensureSxtViewer(
      SEXTANT_VIEWER_SCRIPT_URL,
      this.elementRef.nativeElement as HTMLElement,
    );
    if (this.viewer) {
      this.viewer.setContext(this.mapContext());
    }
  }

  private addLayersToEmbeddedMap(commands: Gn4MapCommand[], focusCommands: Gn4MapCommand[]) {
    if (!this.viewer) {
      return;
    }

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
