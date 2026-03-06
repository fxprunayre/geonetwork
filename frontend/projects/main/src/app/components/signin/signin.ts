import { Component } from '@angular/core';
import { SignInFormComponent } from 'gn-library';

@Component({
  selector: 'app-signin-page',
  standalone: true,
  template: ` <div class="flex flex-column h-full w-full">
    <app-sign-in-form class="grow"></app-sign-in-form>
  </div>`,
  imports: [SignInFormComponent],
})
export class SigninComponent {}
