import { Component, computed, effect, ElementRef, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidEllipsisVertical,
  faSolidShareNodes,
  faSolidUpRightFromSquare,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RecordsService } from 'gn4-api-client';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TieredMenu } from 'primeng/tieredmenu';
import { IconStyleService } from '../../../shared/icon-style-service';
import { AuthStore } from '../../authentication/auth.store';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_SPACE } from '../../config/gn-constants';
import { RecordFieldBase } from '../record-field-base/record-field-base';

@Component({
  selector: 'app-record-menu',
  templateUrl: './record-menu.component.html',
  standalone: true,
  imports: [ButtonModule, NgIcon, TieredMenu, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidEllipsisVertical,
    }),
  ],
})
export class RecordMenuComponent extends RecordFieldBase implements OnInit {
  private readonly recordsService = inject(RecordsService);
  private readonly translate = inject(TranslateService);
  private readonly elementRef = inject(ElementRef);
  private readonly iconStyleService = inject(IconStyleService);
  private authStore = inject(AuthStore);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  catalogueUrl = computed(() => this.appConfiguration().catalogueUrl);

  shareUrl = signal('');

  currentLang = signal(this.translate.getCurrentLang());

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
    return [
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
  });

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
      ],
      this.elementRef.nativeElement.getRootNode(),
    );
  }
}
