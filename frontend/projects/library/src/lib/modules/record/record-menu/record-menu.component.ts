import { Location } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  faSolidEllipsisVertical,
  faSolidPenToSquare,
  faSolidShareNodes,
  faSolidTrash,
  faSolidUpRightFromSquare,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RecordsService } from 'gn4-api-client';
import { MenuItem, MessageService } from 'primeng/api';

import { MenubarModule } from 'primeng/menubar';
import { DeleteConfirmationDialog } from '../../../shared/widgets/delete-confirmation-dialog/delete-confirmation-dialog';
import { AssociatedRecordsSummary } from '../../record-associations/associated-records-summary/associated-records-summary';

import { IconStyleService } from '../../../shared/icon-style-service';
import { AuthStore } from '../../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_SPACE } from '../../config/gn-constants';
import { Gn4UrlService } from '../../config/gn4-url.service';
import { RecordActionService } from '../../record-actions/record-action.service';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-menu',
  templateUrl: './record-menu.component.html',
  standalone: true,
  imports: [MenubarModule, TranslatePipe, DeleteConfirmationDialog, AssociatedRecordsSummary],
  viewProviders: [
    provideIcons({
      faSolidEllipsisVertical,
      faSolidPenToSquare,
      faSolidTrash,
    }),
  ],
})
export class RecordMenuComponent extends RecordFieldBase implements OnInit {
  private readonly recordsService = inject(RecordsService);
  private readonly recordActionService = inject(RecordActionService);
  private readonly translate = inject(TranslateService);
  private readonly elementRef = inject(ElementRef);
  private readonly iconStyleService = inject(IconStyleService);
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private location = inject(Location);
  private gn4UrlService = inject(Gn4UrlService);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  shareUrl = signal('');

  currentLang = signal(this.translate.getCurrentLang());

  displayConfirmation = false;
  confirmationWord = 'DELETE';

  canDelete = computed(() => {
    return this.authStore.isAuthenticated() && this.record().info?.edit;
  });

  constructor() {
    super();
    effect((onCleanup) => {
      const uuid = this.record().uuid;
      if (!uuid) {
        this.shareUrl.set('');
        return;
      }

      const sub = this.recordsService.getRecordPermalink(uuid).subscribe({
        next: (url) => this.shareUrl.set(url),
        error: () => this.shareUrl.set(''),
      });

      onCleanup(() => {
        sub.unsubscribe();
      });
    });
  }

  downloadUrl = computed(() => {
    const uuid = this.record().uuid;
    if (!uuid) {
      return '';
    }
    return `${this.catalogueUrl()}/${DEFAULT_SPACE}/api/records/${uuid}/formatters/xml`;
  });

  items = computed<MenuItem[]>(() => {
    this.currentLang();
    const arr: MenuItem[] = [
      {
        label: this.translate.instant('record.action.share'),
        title: this.translate.instant('record.action.shareHelp'),
        icon: 'icon-share-nodes',
        url: this.shareUrl(),
        target: '_blank',
        visible: !!this.shareUrl(),
      },
      {
        label: this.translate.instant('record.action.metadataDownload'),
        title: this.translate.instant('record.action.metadataDownloadHelp'),
        icon: 'icon-external-link',
        url: this.downloadUrl(),
        target: '_blank',
      },
    ];

    if (this.authStore.isAuthenticated() && this.record().info?.edit) {
      arr.push({
        label: this.translate.instant('record.action.edit'),
        title: this.translate.instant('record.action.editTitle'),
        icon: 'icon-pen-to-square',
        command: () => {
          const uuid = this.record().uuid;
          if (uuid) {
            window.open(this.gn4UrlService.getEditorUrl(`metadata/${uuid}`), '_blank');
          }
        },
      });
      arr.push({
        label: this.translate.instant('delete'),
        title: this.translate.instant('record.action.deleteTitle'),
        icon: 'icon-trash',
        command: () => {
          this.confirmDeletion();
        },
      });
    }

    return arr;
  });

  confirmDeletion() {
    this.displayConfirmation = true;
  }

  deleteRecord() {
    const uuid = this.record().uuid;
    if (!uuid) return;

    this.displayConfirmation = false;
    this.recordActionService.deleteRecord(uuid).subscribe();
  }

  ngOnInit() {
    this.translate.onLangChange.subscribe((event) => {
      this.currentLang.set(event.lang);
    });

    this.iconStyleService.ensureIconsStyle(
      'gn-share-icon-style',
      [
        {
          className: 'icon-share-nodes',
          svgContent: faSolidShareNodes,
        },
        {
          className: 'icon-external-link',
          svgContent: faSolidUpRightFromSquare,
        },
        {
          className: 'icon-pen-to-square',
          svgContent: faSolidPenToSquare,
        },
        {
          className: 'icon-trash',
          svgContent: faSolidTrash,
        },
      ],
      this.elementRef.nativeElement.getRootNode(),
    );
  }
}
