import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-record-field-coverage-coordinate',
  imports: [FormsModule, InputNumber, IftaLabelModule, TranslatePipe],
  template: `
    <p-iftalabel>
      <p-inputnumber
        [ngModel]="value()"
        [mode]="'decimal'"
        [fluid]="true"
        [minFractionDigits]="2"
        [maxFractionDigits]="2"
        suffix="°"
        [disabled]="true"
      ></p-inputnumber>
      <label>{{ label() | translate }}</label>
    </p-iftalabel>
  `,
})
export class RecordFieldCoverageCoordinate {
  value = input<number>();
  label = input<string>('');
}
