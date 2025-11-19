import { Component, Input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-date-parser',
  standalone: true,
  template: ` <span>{{ formattedDate() }}</span> `,
})
export class DateComponent {
  @Input() set value(val: string | null | undefined) {
    this._value.set(val ?? '');
  }

  private _value = signal('');

  formattedDate = computed(() => {
    const v = this._value();

    if (!v) return '';

    const datePart = v.split('T')[0]; // "2024-11-19"
    const [year, month, day] = datePart.split('-');

    return `${day}-${month}-${year}`;
  });
}
