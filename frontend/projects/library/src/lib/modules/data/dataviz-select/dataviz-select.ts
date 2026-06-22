import { Component, input, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { DatavizSource } from '../dataviz.model';

@Component({
  selector: 'app-dataviz-select',
  imports: [FormsModule, ReactiveFormsModule, Select, TranslatePipe],
  templateUrl: './dataviz-select.html',
})
export class DatavizSelect {
  datavizSources = input<DatavizSource[]>([]);
  dataviz = model<DatavizSource | undefined>();
}
