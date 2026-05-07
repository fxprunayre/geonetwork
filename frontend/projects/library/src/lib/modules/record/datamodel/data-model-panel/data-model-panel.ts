import { Component, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { RecordFieldBase } from '../../record-field-base/record-field-base';

@Component({
  selector: 'app-data-model-panel',
  imports: [TableModule, TranslatePipe],
  templateUrl: './data-model-panel.html',
})
export class DataModelPanel extends RecordFieldBase {
  tables = computed(() => {
    return this.record()?.featureTypes || [];
  });
}
