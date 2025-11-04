import { Component, input } from '@angular/core';
import { RecordFieldBase } from '../record-field-base/record-field-base';
import { Chip } from 'primeng/chip';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidChevronRight } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-record-field-type',
  imports: [Chip, NgIcon],
  viewProviders: [provideIcons({ faSolidChevronRight })],
  standalone: true,
  templateUrl: './record-field-type.html',
})
export class RecordFieldType extends RecordFieldBase {
  withSpatialType = input<boolean>(false);
}
