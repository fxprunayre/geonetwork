import { Component, computed, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEllipsisVertical } from '@ng-icons/font-awesome/solid';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { environment } from '../../../../environments/environment.sextant';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-record-menu',
  templateUrl: './record-menu.component.html',
  standalone: true,
  imports: [Menu, ButtonModule, NgIcon],
  viewProviders: [
    provideIcons({
      faSolidEllipsisVertical,
    }),
  ],
  providers: [MessageService],
})
export class RecordMenuComponent extends RecordFieldBase implements OnInit {
  private readonly baseUrl = environment.geonetworkApiUrl;
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  items!: MenuItem[];

  ngOnInit() {
    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'Share',
            icon: 'pi pi-share',
            command: () => this.shareRecord(),
          },
          {
            label: 'Export (XML)',
            icon: 'pi pi-external-link',
            command: () => this.exportXml(),
          },
        ],
      },
    ];
  }

  private getPermalinkUrl(uuid: string) {
    return `${this.baseUrl}/srv/api/records/${uuid}/permalink`;
  }

  private recordApiUrl(path: string) {
    return `${this.baseUrl}/srv/api/records/${this.record().uuid}/${path}`;
  }

  async shareRecord() {
    const uuid = this.record()?.uuid;

    if (!uuid) {
      console.warn('No record UUID available for sharing');
      return;
    }

    try {
      const response = await fetch(this.getPermalinkUrl(uuid));

      if (!response.ok) {
        throw new Error(`Permalink request failed (${response.status})`);
      }

      const data: { url?: string } = await response.json();

      if (!data.url) {
        throw new Error('Permalink response missing url');
      }

      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Failed to fetch permalink', err);

      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('share.title_error'),
        detail: this.translate.instant('share.detail_error'),
        life: 3000,
      });
    }
  }

  exportXml() {
    window.open(this.recordApiUrl('formatters/xml'), '_blank');
  }
}
