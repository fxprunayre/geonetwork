import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-record-field-coverage-coordinate',
  imports: [FormsModule, IftaLabelModule, InputNumber, TranslatePipe],
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
