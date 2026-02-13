import { Component, input, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Datasource } from '../duck-db-service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-datasource-select',
  imports: [ReactiveFormsModule, Select, FormsModule, TranslatePipe],
  templateUrl: './datasource-select.html',
})
export class DatasourceSelect {
  datasources = input<Datasource[]>([]);
  datasource = model<Datasource | undefined>();
}
