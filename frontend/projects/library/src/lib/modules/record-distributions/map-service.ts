import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WmsEndpoint, WmtsEndpoint } from '@camptocamp/ogc-client';
import { Link } from 'gn-api-client';
import { MAP_ROUTE_PATH, RECORD_ROUTE_PATH } from '../search/search-constant';

export interface Gn4MapCommand {
  type?: 'wms' | 'wmts';
  uuid?: string;
  url: string;
  name?: string;
  label?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private router = inject(Router);

  isWmsLink(link: Link): boolean {
    return (
      !!link.urlObject?.['default'] && !!link.protocol?.match('OGC:WMS|application/vnd.ogc.wms_xml')
    );
  }

  async resolveEndpointLayers(link: Link): Promise<any[] | null> {
    const url = link.urlObject?.['default'];
    if (!url) {
      return null;
    }

    const protocol = link.protocol || '';
    if (protocol.includes('OGC:WMTS')) {
      const endpoint = new WmtsEndpoint(url);
      await endpoint.isReady();
      return endpoint.getLayers();
    }

    const endpoint = new WmsEndpoint(url);
    await endpoint.isReady();
    return endpoint.getFlattenedLayers();
  }

  matchRequestedLayers(
    layers: any[] | null,
    layerNamesValue: string | null | undefined,
  ): any[] | null {
    if (!layers || !layerNamesValue) {
      return null;
    }

    const requestedLayerNames = layerNamesValue
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    if (requestedLayerNames.length === 0) {
      return null;
    }

    const matchedLayers = layers.filter((layer: any) => requestedLayerNames.includes(layer.name));
    const allFound = requestedLayerNames.every((name) =>
      matchedLayers.some((layer: any) => layer.name === name),
    );

    return allFound ? matchedLayers : null;
  }

  matchRequestedLayerLabels(
    layers: any[] | null,
    layerNamesValue: string | null | undefined,
  ): string[] | null {
    const matchedLayers = this.matchRequestedLayers(layers, layerNamesValue);
    if (!matchedLayers) {
      return null;
    }

    return matchedLayers.map((layer: any) => layer.title || layer.name);
  }

  buildMapCommands(
    links: Link[],
    recordUuid: string | undefined,
    type: 'wms' | 'wmts',
    label?: string,
  ): Gn4MapCommand[] {
    if (!recordUuid) {
      return [];
    }

    return links
      .filter((link) => link.urlObject)
      .map((link) => {
        const command: Gn4MapCommand = {
          type,
          url: encodeURIComponent(link.urlObject!['default']),
          uuid: recordUuid,
        };

        if (link.nameObject) {
          command.name = encodeURIComponent(link.nameObject['default']);
        }

        command.label = encodeURIComponent(label || command.name || '');
        return command;
      });
  }

  navigateToMap(
    commands: Gn4MapCommand[],
    recordUuid: string | undefined,
    mapLayerDisplayTarget: string,
  ): void {
    if (commands.length === 0 || !recordUuid) {
      return;
    }

    if (mapLayerDisplayTarget === 'explore-embedded-map') {
      void this.router.navigate([RECORD_ROUTE_PATH, recordUuid, 'explore'], {
        queryParams: { wmsAdd: JSON.stringify(commands) },
        queryParamsHandling: 'merge',
      });
      return;
    }

    void this.router.navigate([MAP_ROUTE_PATH], {
      queryParams: { add: JSON.stringify(commands) },
    });
  }
}
