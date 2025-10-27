import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-result-number',
  imports: [],
  templateUrl: './result-number.html',
  styleUrl: './result-number.scss',
})
export class ResultNumber {
  @Input() totalCount: number = 0;
}
