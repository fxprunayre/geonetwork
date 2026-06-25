import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { AuthenticationService } from '../authentication.service';
import { SignInFormComponent } from './sign-in-form';

describe('SignInFormComponent', () => {
  let component: SignInFormComponent;
  let fixture: ComponentFixture<SignInFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        MessageService,
        { provide: AuthenticationService, useValue: { getAuthenticationProviders: () => of([]) } },
        { provide: ActivatedRoute, useValue: { parent: null } },
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
      imports: [BrowserAnimationsModule, SignInFormComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.loginForm().valid()).toBeFalsy();
  });

  it('should be valid when filled', () => {
    component.loginModel.set({ email: 'test', password: 'test' });
    fixture.detectChanges();
    expect(component.loginForm().valid()).toBeTruthy();
  });
});
