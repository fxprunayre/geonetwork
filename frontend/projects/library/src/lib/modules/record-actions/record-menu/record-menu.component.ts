import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidEllipsisVertical,
  faSolidLock,
  faSolidLockOpen,
  faSolidPenToSquare,
  faSolidShareNodes,
  faSolidTrash,
  faSolidUpRightFromSquare,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RecordsService } from 'gn4-api-client';
import { MenuItem } from 'primeng/api';

import { MenubarModule } from 'primeng/menubar';
import { AssociatedRecordsSummary } from '../../record-associations/associated-records-summary/associated-records-summary';
import { DeleteConfirmationDialog } from '../record-deletion/delete-confirmation-dialog/delete-confirmation-dialog';

import { ButtonModule } from 'primeng/button';
import { TieredMenu } from 'primeng/tieredmenu';
import { IconStyleService } from '../../../shared/icon-style-service';
import { AuthStore } from '../../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_SPACE } from '../../config/gn-constants';
import { Gn4UrlService } from '../../config/gn4-url.service';
import { SharingMode } from '../../config/model/gnConfig';
import { RecordFieldBase } from '../../record/record-field-base/record-field-base';
import { RecordActionService } from '../record-action.service';
import { RecordSharingByGroupPanelComponent } from '../record-sharing/record-sharing-by-group-panel/record-sharing-by-group-panel.component';
import { RecordSharingService } from '../record-sharing/record-sharing.services';

@Component({
  selector: 'app-record-menu',
  templateUrl: './record-menu.component.html',
  standalone: true,
  imports: [
    MenubarModule,
    TranslatePipe,
    DeleteConfirmationDialog,
    AssociatedRecordsSummary,
    RecordSharingByGroupPanelComponent,
    TieredMenu,
    ButtonModule,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      faSolidEllipsisVertical,
      faSolidShareNodes,
      faSolidLockOpen,
      faSolidLock,
      faSolidPenToSquare,
      faSolidTrash,
    }),
  ],
})
export class RecordMenuComponent extends RecordFieldBase implements OnInit {
  private readonly recordsService = inject(RecordsService);
  private readonly recordActionService = inject(RecordActionService);
  private readonly recordSharingService = inject(RecordSharingService);
  private readonly translate = inject(TranslateService);
  private readonly elementRef = inject(ElementRef);
  private readonly iconStyleService = inject(IconStyleService);
  private readonly authStore = inject(AuthStore);
  private readonly gn4UrlService = inject(Gn4UrlService);

  readonly appConfiguration = inject(APPLICATION_CONFIGURATION);
  readonly catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);
  readonly sharingMode = computed<SharingMode>(
    () => this.appConfiguration().config?.apps?.sharing?.sharingMode ?? 'none',
  );
  isByGroupSharing = computed(() => this.sharingMode() === 'byGroup');

  shareUrl = signal('');
  currentLang = signal(this.translate.getCurrentLang());

  displayConfirmation = false;
  displayByGroupSharingPanel = false;
  confirmationWord = 'DELETE';
  sharingChanged = output<void>();

  canDelete = computed(() => this.authStore.isAuthenticated() && this.record().info?.edit);

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

  readonly downloadUrl = computed(() => {
    const uuid = this.record().uuid;
    if (!uuid) {
      return '';
    }
    return `${this.catalogueUrl()}/${DEFAULT_SPACE}/api/records/${uuid}/formatters/xml`;
  });

  readonly items = computed<MenuItem[]>(() => {
    this.currentLang();
    const arr: MenuItem[] = [
      {
        label: this.translate.instant('record.action.permalink.label'),
        title: this.translate.instant('record.action.permalink.help'),
        icon: 'icon-share-nodes',
        url: this.shareUrl(),
        target: '_blank',
        visible: !!this.shareUrl(),
      },
      {
        label: this.translate.instant('record.action.metadataDownload.label'),
        title: this.translate.instant('record.action.metadataDownload.help'),
        icon: 'icon-external-link',
        url: this.downloadUrl(),
        target: '_blank',
      },
    ];

    if (this.authStore.isAuthenticated() && this.record().info?.edit) {
      arr.push({ separator: true });
      const isPublishedToAll = String(this.record().isPublishedToAll).toLowerCase() === 'true';

      const sharingMenuItem = this.recordSharingService.createSharingMenuItem({
        uuid: this.record().uuid,
        isPublishedToAll,
        translate: (key) => this.translate.instant(key),
        onChanged: () => this.sharingChanged.emit(),
        onByGroupRequested: () => {
          this.displayByGroupSharingPanel = true;
        },
      });
      if (sharingMenuItem) {
        arr.push(sharingMenuItem);
      }

      arr.push({
        label: this.translate.instant('record.action.edit.label'),
        title: this.translate.instant('record.action.edit.help'),
        icon: 'icon-pen-to-square',
        command: () => {
          const uuid = this.record().uuid;
          if (uuid) {
            window.open(this.gn4UrlService.getEditorUrl(`metadata/${uuid}`), '_blank');
          }
        },
      });

      arr.push({
        label: this.translate.instant('record.action.delete.label'),
        title: this.translate.instant('record.action.delete.help'),
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

  onByGroupSharingSaved() {
    this.displayByGroupSharingPanel = false;
    this.sharingChanged.emit();
  }

  ngOnInit(): void {
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
        {
          className: 'icon-lock',
          svgContent: faSolidLock,
        },
        {
          className: 'icon-lock-open',
          svgContent: faSolidLockOpen,
        },
      ],
      this.elementRef.nativeElement.getRootNode(),
    );
  }
}
