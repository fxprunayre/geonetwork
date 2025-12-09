import { Component, computed } from '@angular/core';
import { RecordFieldBase } from '../../record-field-base/record-field-base';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';

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
