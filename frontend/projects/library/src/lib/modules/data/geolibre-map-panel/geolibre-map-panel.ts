import { Component, input } from '@angular/core';
import { FullScreenPanel } from '../../../shared/widgets/full-screen-panel/full-screen-panel';
import { Gn4MapCommand } from '../../record-distributions/map-service';
import { GeoLibreMap } from '../geolibre-map/geolibre-map';

@Component({
  selector: 'app-geolibre-map-panel',
  imports: [FullScreenPanel, GeoLibreMap],
  templateUrl: './geolibre-map-panel.html',
})
export class GeoLibreMapPanel {
  mapContext = input.required<Record<string, unknown>>();
  commands = input<Gn4MapCommand[]>([]);
  focusCommands = input<Gn4MapCommand[]>([]);
  isActive = input<boolean>(true);
}
