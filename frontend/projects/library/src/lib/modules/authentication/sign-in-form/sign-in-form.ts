import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faUser } from '@ng-icons/font-awesome/regular';
import { faSolidLock } from '@ng-icons/font-awesome/solid';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthenticationService, AuthenticationProvider } from '../authentication.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FocusTrap } from 'primeng/focustrap';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CatalogueLogo } from '../../catalogue/catalogue-logo/catalogue-logo';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { AutoFocusModule } from 'primeng/autofocus';
import { AuthStore } from '../auth.store';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    PasswordModule,
    IconFieldModule,
    CardModule,
    NgIcon,
    FloatLabelModule,
    CatalogueLogo,
    DividerModule,
    FormField,
    ToastModule,
    MessageModule,
    AutoFocusModule,
  ],
  providers: [],
  viewProviders: [provideIcons({ faUser, faSolidLock })],
  templateUrl: './sign-in-form.html',
})
export class SignInFormComponent {
  private authService = inject(AuthenticationService);
  private translateService = inject(TranslateService);
  private route = inject(ActivatedRoute);
  readonly store = inject(AuthStore);

  signinFailure = computed(() => !!this.store.error());

  appConfiguration = inject(APPLICATION_CONFIGURATION);

  authenticationProviders = toSignal(this.authService.getAuthenticationProviders(), {
    initialValue: [],
  });

  hasDatabaseProvider = computed(() =>
    this.authenticationProviders().some((provider) => provider.id === 'database'),
  );

  // TODO: Setting option?
  hasForgotPassword = computed(() => this.hasDatabaseProvider());

  // TODO: Setting option?
  hasSignup = computed(() => this.hasDatabaseProvider());

  externalProviders = computed(() =>
    this.authenticationProviders().filter((provider) => provider.id !== 'database'),
  );

  hasExternalProviders = computed(() => this.externalProviders().length > 0);

  hasOnlyOneProvider = computed(() => this.authenticationProviders().length === 1);

  backgroundImageUrl = computed(() => this.appConfiguration().config?.backgroundImageUrl || '');

  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.email, { message: this.translateService.instant('error.required') });
    //email(fieldPath.email, { message: this.translateService.instant('error.invalidEmail') });
    required(fieldPath.password, { message: this.translateService.instant('error.required') });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, async () => {
      const credentials = this.loginModel();
      const redirectUrl = this.route.snapshot.queryParams['redirectUrl'] || '/';
      this.store.signIn({
        username: credentials.email,
        password: credentials.password,
        redirectUrl,
      });
    });
  }
}
