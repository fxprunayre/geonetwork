import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumber } from 'primeng/inputnumber';

let nextId = 0;

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
        [inputId]="inputId"
      ></p-inputnumber>
      <label [for]="inputId">{{ label() | translate }}</label>
    </p-iftalabel>
  `,
})
export class RecordFieldCoverageCoordinate {
  value = input<number>();
  label = input<string>('');
  inputId = `record-field-coverage-coordinate-${nextId++}`;
}
