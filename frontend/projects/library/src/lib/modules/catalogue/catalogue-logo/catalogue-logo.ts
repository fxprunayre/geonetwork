import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-catalogue-logo',
  imports: [],
  template: `<a routerLink="/">
    <img [src]="logo" alt="Logo" class="h-12 md:h-16" />
  </a>`,
})
export class CatalogueLogo {
  logo = 'images/logo.svg';
}
