import { Component, inject, input, OnInit, signal } from '@angular/core';
import WFS from '@camptocamp/ogc-client/dist/wfs/endpoint.js';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCloudArrowDown } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Link } from 'gn-api-client';
import { MenuItem } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Button, ButtonIcon, ButtonLabel } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Skeleton } from 'primeng/skeleton';
import { TieredMenu } from 'primeng/tieredmenu';

interface WfsDownloadConfig {
  label: string;
  menuItems: MenuItem[];
}

@Component({
  selector: 'app-download-data',
  imports: [
    Button,
    MenuModule,
    TranslatePipe,
    NgIcon,
    ButtonIcon,
    ButtonLabel,
    TieredMenu,
    Badge,
    Skeleton,
  ],
  viewProviders: [
    provideIcons({
      faSolidCloudArrowDown,
    }),
  ],
  templateUrl: './download-data.html',
})
export class DownloadData implements OnInit {
  link = input.required<Link>();
  formats = signal<string[]>([]);
  friendlyFormats = signal<string[]>([]);
  loading = signal(false);
  isWfs = signal(false);
  wfsConfigs = signal<WfsDownloadConfig[]>([]);
  private translate = inject(TranslateService);

  ngOnInit() {
    this.checkLink();
  }

  async checkLink() {
    const protocol = this.link().protocol || '';
    if (protocol.includes('OGC:WFS') || protocol.includes('WFS')) {
      this.isWfs.set(true);
      this.loading.set(true);
      try {
        const url = this.link().urlObject?.['default'] || '';
        if (!url) return;
        const wfs = new WFS(url);
        await wfs.isReady();
        const info = wfs.getServiceInfo();
        let outputFormats = info?.outputFormats || [
          'text/xml; subtype=gml/3.1.1',
          'application/json',
          'csv',
        ];

        const gmlFormats = outputFormats.filter((f) => /gml/i.test(f));
        if (gmlFormats.length > 1) {
          const latestGml = gmlFormats.reduce((latest, current) => {
            const getVer = (f: string) => {
              const match = f.match(/gml[^\d]*(\d+(?:\.\d+)*)/i);
              return match ? match[1] : '0';
            };
            const v1 = getVer(latest).split('.').map(Number);
            const v2 = getVer(current).split('.').map(Number);

            for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
              const n1 = v1[i] || 0;
              const n2 = v2[i] || 0;
              if (n1 > n2) return latest;
              if (n2 > n1) return current;
            }
            return latest;
          });
          outputFormats = outputFormats.filter((f) => !/gml/i.test(f) || f === latestGml);
        }

        this.formats.set(outputFormats);
        this.friendlyFormats.set(outputFormats.map((f) => this.getFriendlyFormatName(f)));

        const name = this.link().nameObject?.['default'] || '';
        const types = name
          ? name
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [''];

        const configs: WfsDownloadConfig[] = types.map((typeName) => {
          const featureTypeInfo = typeName ? wfs.getFeatureTypeSummary(typeName) : null;
          const displayLabel =
            featureTypeInfo?.title || typeName || this.translate.instant('download');

          return {
            label: displayLabel,
            menuItems: this.formats()
              .map((f) => ({
                label: this.getFriendlyFormatName(f),
                command: () => this.downloadWfs(f, wfs, typeName),
              }))
              .sort((a, b) => a.label.localeCompare(b.label)),
          };
        });

        this.wfsConfigs.set(configs);
      } catch (e) {
        console.error('Failed to get WFS capabilities', e);
      } finally {
        this.loading.set(false);
      }
    }
  }

  getFriendlyFormatName(format: string): string {
    const f = format.toLowerCase();
    if (f.includes('json')) return 'GeoJSON';
    if (f.includes('gml')) return 'GML';
    if (f.includes('csv')) return 'CSV';
    if (f.includes('shapezip') || f.includes('shape-zip') || f.includes('shp')) return 'Shapefile';
    if (f.includes('kml')) return 'KML';
    if (f.includes('geopackage') || f.includes('gpkg')) return 'GeoPackage';
    if (f.includes('excel') || f.includes('xls')) return 'Excel';
    return format;
  }

  downloadWfs(format: string, wfs: any, typeName: string) {
    const urlStr = this.link().urlObject?.['default'] || '';
    try {
      const url = new URL(urlStr);
      url.searchParams.set('request', 'GetFeature');
      url.searchParams.set('service', 'WFS');
      url.searchParams.set('version', wfs?.getVersion() || '2.0.0');
      if (typeName) {
        // Use typeName parameter
        url.searchParams.set('typeName', typeName);
        // Ensure there's no typeNames param causing conflicts
        url.searchParams.delete('typeNames');
      }
      url.searchParams.set('outputFormat', format);
      window.open(url.toString(), '_blank');
    } catch (e) {
      window.open(urlStr, '_blank');
    }
  }
}
