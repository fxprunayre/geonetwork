import { Component, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-mask',
  imports: [ProgressSpinner, TranslatePipe],
  standalone: true,
  templateUrl: './loading-mask.component.html',
})
export class LoadingMask {
  loading = input.required<boolean>();
  message = signal('Loading...');
}
