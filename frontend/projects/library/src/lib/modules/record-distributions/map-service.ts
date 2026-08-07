import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WmsEndpoint, WmtsEndpoint } from '@camptocamp/ogc-client';
import { Link } from 'gn-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP, MapLayerDisplayTarget } from '../record';
import { MAP_ROUTE_PATH, RECORD_ROUTE_PATH } from '../search/search-constant';

export interface Gn4MapCommand {
  type?: 'wms' | 'wmts';
  uuid?: string;
  url: string;
  name?: string;
  label?: string;
}

export interface BulkWmsValidationResult {
  validLinks: Link[];
  matchedLayerLabels: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private router = inject(Router);
  private appConfiguration = inject(APPLICATION_CONFIGURATION);

  hasBulkWmsLinks(links: Link[], minLinks = 2): boolean {
    return links.length >= minLinks && links.every((link) => this.isWmsLink(link));
  }

  isWmsLink(link: Link): boolean {
    return (
      !!link.urlObject?.['default'] && !!link.protocol?.match('OGC:WMS|application/vnd.ogc.wms_xml')
    );
  }

  async resolveEndpointLayers(link: Link): Promise<unknown[] | null> {
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

    try {
      const endpoint = new WmsEndpoint(url);
      await endpoint.isReady();
      return endpoint.getFlattenedLayers();
    } catch (error) {
      const proxyUrl = this.appConfiguration().config?.proxyUrl;
      if (!proxyUrl) {
        console.warn('WMS capabilities request failed and no proxy URL is configured.');
        throw error;
      }

      const proxiedEndpoint = new WmsEndpoint(`${proxyUrl}${encodeURIComponent(url)}`);
      await proxiedEndpoint.isReady();
      return proxiedEndpoint.getFlattenedLayers();
    }
  }

  matchRequestedLayers(
    layers: unknown[] | null,
    layerNamesValue: string | null | undefined,
  ): unknown[] | null {
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

    const typedLayers = layers as { name: string }[];
    const matchedLayers = typedLayers.filter((layer) => requestedLayerNames.includes(layer.name));
    const allFound = requestedLayerNames.every((name) =>
      matchedLayers.some((layer) => layer.name === name),
    );

    return allFound ? matchedLayers : null;
  }

  matchRequestedLayerLabels(
    layers: unknown[] | null,
    layerNamesValue: string | null | undefined,
  ): string | null {
    const matchedLayers = this.matchRequestedLayers(layers, layerNamesValue);
    if (!matchedLayers) {
      return null;
    }

    const typedLayers = matchedLayers as { name: string; title?: string }[];
    return typedLayers.map((layer) => layer.title || layer.name).join(', ');
  }

  async validateBulkWmsLinks(links: Link[], minLinks = 2): Promise<BulkWmsValidationResult | null> {
    const wmsLinks = links.filter((link) => this.isWmsLink(link));
    if (!this.hasBulkWmsLinks(wmsLinks, minLinks)) {
      return null;
    }

    const results = await Promise.all(wmsLinks.map((link) => this.resolveWmsLinkLabels(link)));
    if (results.some((result) => result === null)) {
      return null;
    }

    return {
      validLinks: wmsLinks,
      matchedLayerLabels: results.flatMap((result) => result!),
    };
  }

  private async resolveWmsLinkLabels(link: Link): Promise<string | null> {
    const layers = await this.resolveEndpointLayers(link);
    return this.matchRequestedLayerLabels(layers, link.nameObject?.['default']);
  }

  buildMapCommands(
    links: Link[],
    recordUuid: string | undefined,
    type: 'wms' | 'wmts',
    label?: string[],
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

        command.label = encodeURIComponent(label?.[links.indexOf(link)] || command.name || '');
        return command;
      });
  }

  navigateToMap(
    commands: Gn4MapCommand[],
    recordUuid: string | undefined,
    mapLayerDisplayTarget: MapLayerDisplayTarget,
  ): void {
    if (commands.length === 0 || !recordUuid) {
      return;
    }

    if (mapLayerDisplayTarget === MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP) {
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
