import { Component, computed } from '@angular/core';
import { RecordFieldBase } from '../../record-field-base/record-field-base';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-data-model-panel',
  imports: [TableModule],
  templateUrl: './data-model-panel.html',
})
export class DataModelPanel extends RecordFieldBase {
  tables = computed(() => {
    return this.record()?.featureTypes || [];
  });
}
