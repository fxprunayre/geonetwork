import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-feedback-panel',
  imports: [TranslatePipe],
  templateUrl: './feedback-panel.html',
})
export class FeedbackPanel {}
