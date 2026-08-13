import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WfsEndpoint, WmsEndpoint, WmtsEndpoint } from '@camptocamp/ogc-client';
import { Link } from 'gn-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { MapType } from '../config/model/gnConfig';
import { MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP, MapLayerDisplayTarget } from '../record';
import { MAP_ROUTE_PATH, RECORD_ROUTE_PATH } from '../search/search-constant';

export interface Gn4MapCommand {
  type?: 'wms' | 'wmts' | 'wfs' | 'geojson' | 'geoparquet' | 'cog';
  uuid?: string;
  url: string;
  name?: string;
  label?: string;
  boundsWgs84?: [number, number, number, number];
}

export type Gn4MapCommandType = 'wms' | 'wmts' | 'wfs' | 'geojson' | 'geoparquet' | 'cog';

export interface BulkWmsValidationResult {
  validLinks: Link[];
  matchedLayerLabels: string[];
  boundsByLinkKey: Record<string, [number, number, number, number]>;
}

export interface BulkWfsValidationResult {
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

  hasBulkWfsLinks(links: Link[], minLinks = 2): boolean {
    return links.length >= minLinks && links.every((link) => this.isWfsLink(link));
  }

  hasBulkMapLinks(links: Link[], mapType: MapType, minLinks = 2): boolean {
    return (
      this.hasBulkWmsLinks(links, minLinks) ||
      (mapType === 'geolibre' && this.hasBulkWfsLinks(links, minLinks))
    );
  }

  isWmsLink(link: Link): boolean {
    return (
      !!link.urlObject?.['default'] && !!link.protocol?.match('OGC:WMS|application/vnd.ogc.wms_xml')
    );
  }

  isWmtsLink(link: Link): boolean {
    return !!link.urlObject?.['default'] && !!link.protocol?.includes('OGC:WMTS');
  }

  isWfsLink(link: Link): boolean {
    return (
      !!link.urlObject?.['default'] && !!link.protocol?.match('OGC:WFS|application/vnd.ogc.wfs_xml')
    );
  }

  isMapAddLink(link: Link, mapType: MapType): boolean {
    return (
      this.isWmsLink(link) ||
      this.isWmtsLink(link) ||
      (mapType === 'geolibre' &&
        (this.isWfsLink(link) || this.resolveGeoLibreFileLayerType(link) !== null))
    );
  }

  resolveLinkMapCommandType(link: Link, mapType: MapType): Gn4MapCommandType | null {
    if (this.isWmtsLink(link)) {
      return 'wmts';
    }

    if (this.isWmsLink(link)) {
      return 'wms';
    }

    if (mapType === 'geolibre' && this.isWfsLink(link)) {
      return 'wfs';
    }

    if (mapType === 'geolibre') {
      return this.resolveGeoLibreFileLayerType(link);
    }

    return null;
  }

  async supportsWfsGeoJsonOutput(link: Link): Promise<boolean> {
    if (!this.isWfsLink(link)) {
      return false;
    }

    const url = link.urlObject?.['default'];
    if (!url) {
      return false;
    }

    try {
      const endpoint = new WfsEndpoint(url);
      await endpoint.isReady();
      const formats = endpoint.getServiceInfo()?.outputFormats || [];

      if (formats.length > 0) {
        return formats.some((format) => this.isGeoJsonOutputFormat(format));
      }

      return this.isGeoJsonOutputFormat(this.readQueryParam(url, 'outputFormat'));
    } catch {
      return false;
    }
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
      return endpoint.getFlattenedLayers().map((layer) => {
        return endpoint.getLayerByName(layer.name) || layer;
      });
    } catch (error) {
      const proxyUrl = this.appConfiguration().config?.proxyUrl;
      if (!proxyUrl) {
        console.warn('WMS capabilities request failed and no proxy URL is configured.');
        throw error;
      }

      const proxiedEndpoint = new WmsEndpoint(`${proxyUrl}${encodeURIComponent(url)}`);
      await proxiedEndpoint.isReady();
      return proxiedEndpoint.getFlattenedLayers().map((layer) => {
        return proxiedEndpoint.getLayerByName(layer.name) || layer;
      });
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

    const results = await Promise.all(wmsLinks.map((link) => this.resolveWmsLinkValidation(link)));
    if (results.some((result) => result === null)) {
      return null;
    }

    const boundsByLinkKey: Record<string, [number, number, number, number]> = {};
    wmsLinks.forEach((link, index) => {
      const bounds = results[index]!.boundsWgs84;
      if (bounds) {
        boundsByLinkKey[this.linkKey(link)] = bounds;
      }
    });

    return {
      validLinks: wmsLinks,
      matchedLayerLabels: results.map((result) => result!.label),
      boundsByLinkKey,
    };
  }

  async validateBulkWfsLinks(links: Link[], minLinks = 2): Promise<BulkWfsValidationResult | null> {
    const wfsLinks = links.filter((link) => this.isWfsLink(link));
    if (!this.hasBulkWfsLinks(wfsLinks, minLinks)) {
      return null;
    }

    const validLinks = wfsLinks.filter((link) => !!link.urlObject?.['default']);
    if (validLinks.length < minLinks) {
      return null;
    }

    return {
      validLinks,
      matchedLayerLabels: validLinks.map(
        (link) => link.nameObject?.['default'] || link.descriptionObject?.['default'] || '',
      ),
    };
  }

  private async resolveWmsLinkValidation(
    link: Link,
  ): Promise<{ label: string; boundsWgs84: [number, number, number, number] | null } | null> {
    const layers = await this.resolveEndpointLayers(link);
    const matchedLayers = this.matchRequestedLayers(layers, link.nameObject?.['default']);
    if (!matchedLayers) {
      return null;
    }

    const typedLayers = matchedLayers as { name: string; title?: string }[];
    return {
      label: typedLayers.map((layer) => layer.title || layer.name).join(', '),
      boundsWgs84: this.resolveMatchedLayersBoundsWgs84(matchedLayers),
    };
  }

  buildMapCommands(
    links: Link[],
    recordUuid: string | undefined,
    type: Gn4MapCommandType,
    label?: string[],
    boundsByLinkKey?: Record<string, [number, number, number, number]>,
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

        const bounds = boundsByLinkKey?.[this.linkKey(link)];
        if (bounds) {
          command.boundsWgs84 = bounds;
        }

        command.label = encodeURIComponent(label?.[links.indexOf(link)] || command.name || '');
        return command;
      });
  }

  private linkKey(link: Link): string {
    return `${link.urlObject?.['default'] || ''}::${link.nameObject?.['default'] || ''}`;
  }

  private resolveMatchedLayersBoundsWgs84(
    matchedLayers: unknown[],
  ): [number, number, number, number] | null {
    const extents = matchedLayers
      .map((layer) => this.readLayerExtentWgs84(layer as Record<string, unknown>))
      .filter((extent): extent is [number, number, number, number] => extent !== null);

    if (extents.length === 0) {
      return null;
    }

    return extents.reduce(
      (acc, current) => [
        Math.min(acc[0], current[0]),
        Math.min(acc[1], current[1]),
        Math.max(acc[2], current[2]),
        Math.max(acc[3], current[3]),
      ],
      [...extents[0]] as [number, number, number, number],
    );
  }

  private readLayerExtentWgs84(
    layer: Record<string, unknown>,
  ): [number, number, number, number] | null {
    return this.parseBboxCandidateWgs84(layer['boundingBoxes']);
  }

  private parseBboxCandidateWgs84(value: unknown): [number, number, number, number] | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const boxes = value as Record<string, unknown>;
    const epsg4326 = boxes['EPSG:4326'] ?? boxes['epsg:4326'];
    if (!Array.isArray(epsg4326) || epsg4326.length !== 4) {
      return null;
    }

    const bbox = this.normalizeBbox(epsg4326.map((candidate) => Number(candidate)));
    return bbox && this.isWgs84Box(bbox) ? bbox : null;
  }

  private normalizeBbox(values: number[]): [number, number, number, number] | null {
    if (
      values.length !== 4 ||
      values.some((value) => Number.isNaN(value) || !Number.isFinite(value))
    ) {
      return null;
    }

    const [minx, miny, maxx, maxy] = values;
    return [Math.min(minx, maxx), Math.min(miny, maxy), Math.max(minx, maxx), Math.max(miny, maxy)];
  }

  private isWgs84Box([minx, miny, maxx, maxy]: [number, number, number, number]): boolean {
    return (
      minx >= -180 && maxx <= 180 && miny >= -90 && maxy <= 90 && minx !== maxx && miny !== maxy
    );
  }

  private readQueryParam(url: string, name: string): string {
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get(name) || parsed.searchParams.get(name.toUpperCase()) || '';
    } catch {
      return '';
    }
  }

  private isGeoJsonOutputFormat(format: string | null | undefined): boolean {
    return !!format && format.toLowerCase().includes('json');
  }

  private resolveGeoLibreFileLayerType(link: Link): 'geojson' | 'geoparquet' | 'cog' | null {
    const url = link.urlObject?.['default'];
    if (!url) {
      return null;
    }

    const protocol = (link.protocol || '').toLowerCase();
    const path = this.readUrlPath(url);
    if (!path) {
      return null;
    }

    if (path.endsWith('.geojson') || path.endsWith('.json') || protocol.endsWith('geojson')) {
      return 'geojson';
    }

    if (
      path.endsWith('.parquet') ||
      path.endsWith('.geoparquet') ||
      protocol.endsWith('geoparquet')
    ) {
      return 'geoparquet';
    }

    if (path.endsWith('.tif') || path.endsWith('.tiff') || protocol.endsWith('cog')) {
      return 'cog';
    }

    return null;
  }

  private readUrlPath(url: string): string {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.split('?')[0]?.split('#')[0]?.toLowerCase() || '';
    }
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
