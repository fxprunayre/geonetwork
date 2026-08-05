import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidArrowRightToBracket,
  faSolidCloudArrowUp,
  faSolidFile,
} from '@ng-icons/font-awesome/solid';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, MessageService } from 'primeng/api';
import { TieredMenu } from 'primeng/tieredmenu';

// Unused for now. Linking to GN4 editor
@Component({
  selector: 'app-record-add-button',
  imports: [TieredMenu],
  viewProviders: [provideIcons({ faSolidFile, faSolidCloudArrowUp, faSolidArrowRightToBracket })],
  template: `
    <p-tieredmenu #menu [model]="addRecordItems()" [popup]="true" appendTo="body"></p-tieredmenu>
  `,
})
export class RecordAddMenu {
  @ViewChild('menu') menu: TieredMenu | undefined;

  translateService = inject(TranslateService);
  messageService = inject(MessageService);

  currentLang = signal(this.translateService.getCurrentLang(), { equal: () => false });

  addRecordItems = computed<MenuItem[]>(() => {
    this.currentLang();
    return [
      {
        label: this.translateService.instant('New dataset'),
        icon: 'faSolidFile',
        command: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Add record',
            detail: 'From template',
          });
        },
      },
      {
        label: this.translateService.instant('New Software'),
        icon: 'faSolidCloudArrowUp',
        command: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Add record',
            detail: 'From software template',
          });
        },
      },
      {
        label: this.translateService.instant('Import from file or URL'),
        icon: 'faSolidArrowRightToBracket',
        command: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Add record',
            detail: 'Import from file or URL',
          });
        },
      },
    ];
  });
}
