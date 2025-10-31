import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-record-field',
  imports: [TranslatePipe],
  templateUrl: './record-field.html',
})
export class RecordField {
  label = input<string>('');
}
