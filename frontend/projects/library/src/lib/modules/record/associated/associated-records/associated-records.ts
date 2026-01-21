import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output, TemplateRef } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  faSolidBook,
  faSolidBookAtlas,
  faSolidBullhorn,
  faSolidClockRotateLeft,
  faSolidCopy,
  faSolidCrosshairs,
  faSolidDatabase,
  faSolidDiagramNext,
  faSolidExpand,
  faSolidFlask,
  faSolidGavel,
  faSolidGears,
  faSolidHeading,
  faSolidHeadphones,
  faSolidLaptopCode,
  faSolidListCheck,
  faSolidMagnifyingGlass,
  faSolidMicrochip,
  faSolidPaste,
  faSolidPersonChalkboard,
  faSolidShareNodes,
  faSolidShip,
  faSolidShuffle,
  faSolidSitemap,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { Button } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { Drawer } from 'primeng/drawer';
import { ResultItemGrid } from '../../../search-results/result-item-grid/result-item-grid';

@Component({
  selector: 'app-associated-records',
  imports: [TranslatePipe, ResultItemGrid, NgTemplateOutlet, DataView, Button, Drawer, NgIcon],
  providers: [
    provideIcons({
      faSolidBook,
      faSolidBookAtlas,
      faSolidBullhorn,
      faSolidClockRotateLeft,
      faSolidCopy,
      faSolidCrosshairs,
      faSolidDatabase,
      faSolidDiagramNext,
      faSolidExpand,
      faSolidFlask,
      faSolidGavel,
      faSolidGears,
      faSolidHeading,
      faSolidHeadphones,
      faSolidLaptopCode,
      faSolidListCheck,
      faSolidMagnifyingGlass,
      faSolidMicrochip,
      faSolidPaste,
      faSolidPersonChalkboard,
      faSolidShareNodes,
      faSolidShip,
      faSolidShuffle,
      faSolidSitemap,
    }),
  ],
  templateUrl: './associated-records.html',
})
export class AssociatedRecords {
  type = input<string>('');
  relations = input<IndexRecord[]>([]);
  styleClass = input<string>('');
  resultTemplate = input<TemplateRef<unknown>>();
  onRecordClick = output<string>();

  translateService = inject(TranslateService);

  isFullScreen = false;

  pageSize = 3;

  private siblingParts = computed(() => {
    const t = this.type();
    return t.startsWith('siblings_') ? t.split('_') : null;
  });

  associationType = computed(() => {
    const parts = this.siblingParts();
    return parts ? (parts[1] ?? '') : undefined;
  });

  initiativeType = computed(() => {
    const parts = this.siblingParts();
    return parts ? (parts[2] ?? '') : undefined;
  });

  icon = computed(() => {
    const initType = this.initiativeType();
    if (initType) {
      switch (initType) {
        case 'campaign':
          return faSolidBullhorn;
        case 'collection':
          return faSolidShareNodes;
        case 'exercise':
          return faSolidBookAtlas;
        case 'experiment':
          return faSolidFlask;
        case 'investigation':
          return faSolidMagnifyingGlass;
        case 'mission':
          return faSolidCrosshairs;
        case 'sensor':
          return faSolidMicrochip;
        case 'operation':
          return faSolidPersonChalkboard;
        case 'platform':
          return faSolidShip;
        case 'process':
          return faSolidGears;
        case 'program':
          return faSolidLaptopCode;
        case 'project':
          return faSolidPaste;
        case 'study':
        case 'document':
          return faSolidBook;
        case 'task':
          return faSolidListCheck;
        case 'trial':
          return faSolidGavel;
      }
    }

    const assocType = this.associationType();
    if (assocType) {
      switch (assocType) {
        case 'crossReference':
          return faSolidShuffle;
        case 'largerWorkCitation':
        case 'series':
          return faSolidCopy;
        case 'partOfSeamlessDatabase':
          return faSolidDatabase;
        case 'stereoMate':
          return faSolidHeadphones;
        case 'isComposedOf':
          return faSolidSitemap;
        case 'collectiveTitle':
          return faSolidHeading;
        case 'dependency':
          return faSolidDiagramNext;
        case 'revisionOf':
          return faSolidClockRotateLeft;
      }
    }
    return null;
  });

  label = computed(() => {
    const parts = this.siblingParts();

    if (parts) {
      const labels = [
        this.translateService.instant(this.associationType() ?? ''),
        this.translateService.instant(this.initiativeType() ?? ''),
      ];
      return labels.join(' - ');
    }
    return this.translateService.instant('record.association.' + this.type(), {
      count: this.relations().length,
    });
  });

  handleRecordClick(uuid: string) {
    this.isFullScreen = false;
    this.onRecordClick.emit(uuid);
  }
}
