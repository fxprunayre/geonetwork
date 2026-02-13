import { Component, input, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Datasource } from '../duck-db-service';

@Component({
  selector: 'app-datasource-select',
  imports: [FormsModule, ReactiveFormsModule, Select, TranslatePipe],
  templateUrl: './datasource-select.html',
})
export class DatasourceSelect {
  datasources = input<Datasource[]>([]);
  datasource = model<Datasource | undefined>();
}
