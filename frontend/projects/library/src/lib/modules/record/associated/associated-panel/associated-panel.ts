import { Component, computed, input, output, TemplateRef } from '@angular/core';
import { AssociatedRecords } from '.././associated-records/associated-records';
import { IndexRecord, RelatedItemType } from 'gn-api-client';
import { RecordFieldBase } from '../../record-field-base/record-field-base';

@Component({
  selector: 'app-associated-panel',
  imports: [AssociatedRecords],
  templateUrl: './associated-panel.html',
})
export class AssociatedPanel extends RecordFieldBase {
  include = input<RelatedItemType[]>([]);
  exclude = input<RelatedItemType[]>([]);
  resultTemplate = input<TemplateRef<unknown>>();
  onRecordClick = output<string>();

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
