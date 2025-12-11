import { AfterViewInit, Component, ElementRef, OnDestroy, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-record-field',
  imports: [TranslatePipe],
  templateUrl: './record-field.html',
})
export class RecordField implements AfterViewInit, OnDestroy {
  label = input<string>('');
  isEmpty = signal(false);

  private observer: MutationObserver | undefined;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const section = this.el.nativeElement.querySelector('section');
    if (section) {
      this.checkEmpty(section);
      this.observer = new MutationObserver(() => this.checkEmpty(section));
      this.observer.observe(section, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private checkEmpty(element: HTMLElement) {
    const text = element.innerText || '';
    const hasInputs = element.querySelector('input, textarea, select') !== null;
    this.isEmpty.set(text.trim().length === 0 && !hasInputs);
  }
}
