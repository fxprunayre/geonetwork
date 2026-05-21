import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faUser } from '@ng-icons/font-awesome/regular';
import { faSolidLock } from '@ng-icons/font-awesome/solid';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AutoFocusModule } from 'primeng/autofocus';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ThemingService } from '../../../shared/theming-service';
import { CatalogueLogo } from '../../catalogue/catalogue-logo/catalogue-logo';
import { CatalogueStore } from '../../catalogue/catalogue.store';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { AuthStore } from '../auth.store';
import { AuthenticationService } from '../authentication.service';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
  imports: [
    AutoFocusModule,
    ButtonModule,
    CardModule,
    CatalogueLogo,
    CommonModule,
    DividerModule,
    FloatLabelModule,
    FormField,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MessageModule,
    NgIcon,
    PasswordModule,
    ReactiveFormsModule,
    ToastModule,
    TranslateModule,
  ],
  providers: [],
  viewProviders: [provideIcons({ faUser, faSolidLock })],
  templateUrl: './sign-in-form.html',
})
export class SignInFormComponent {
  private authService = inject(AuthenticationService);
  private translateService = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private themingService = inject(ThemingService);
  readonly catalogueStore = inject(CatalogueStore);
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

  bannerBackground = computed(() => this.appConfiguration().config?.apps?.banner?.background || '');

  bannerBackgroundStyle = computed(() =>
    this.themingService.getBannerBackgroundStyle(this.bannerBackground()),
  );

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
