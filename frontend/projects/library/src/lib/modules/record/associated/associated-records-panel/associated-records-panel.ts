import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  Output,
  output,
  TemplateRef,
} from '@angular/core';
import { RecordFieldBase } from '../../record-field-base/record-field-base';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord, RelatedItemType } from 'gn-api-client';
import { ResultItemGrid } from '../../../results/result-item-grid/result-item-grid';
import { Router } from '@angular/router';
import { JsonPipe, NgTemplateOutlet } from '@angular/common';
import { Carousel } from 'primeng/carousel';
import { DataView } from 'primeng/dataview';

@Component({
  selector: 'app-associated-records-panel',
  imports: [TranslatePipe, ResultItemGrid, NgTemplateOutlet, JsonPipe, Carousel, DataView],
  templateUrl: './associated-records-panel.html',
})
export class AssociatedRecordsPanel extends RecordFieldBase {
  router = inject(Router);

  onRecordClick = output<string>();

  include = input<RelatedItemType[]>([]);
  exclude = input<RelatedItemType[]>([]);

  styleClass = input<string>('');

  resultTemplate = input<TemplateRef<unknown>>();

  relations = computed<Record<string, IndexRecord[]>>(() => {
    const relations = JSON.parse(JSON.stringify(this.record().related || {}));
    Object.keys(relations).forEach((key) => {
      if (
        (this.include().length > 0 && !this.include().includes(key as RelatedItemType)) ||
        (this.exclude().length > 0 && this.exclude().includes(key as RelatedItemType))
      ) {
        delete relations?.[key];
      }
    });
    return relations;
  });

  types = computed(() => {
    return Object.keys(this.relations());
  });

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }
}
