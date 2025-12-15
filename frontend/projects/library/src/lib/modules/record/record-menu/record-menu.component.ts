import { Component, computed, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidEllipsisVertical } from '@ng-icons/font-awesome/solid';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { environment } from '../../../../environments/environment';

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
})
export class RecordMenuComponent extends RecordFieldBase implements OnInit {
  private readonly baseUrl = environment.geonetworkApiUrl;

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

  private recordApiUrl(path: string) {
    return `${this.baseUrl}/srv/api/records/${this.record().uuid}/${path}`;
  }

  shareRecord() {
    window.open(this.recordApiUrl('permalink'), '_blank');
  }

  exportXml() {
    window.open(this.recordApiUrl('formatters/xml'), '_blank');
  }
}
