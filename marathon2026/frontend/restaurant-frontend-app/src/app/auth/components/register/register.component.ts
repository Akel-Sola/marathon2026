import { GreenTastyImageComponent } from '../green-tasty-image/green-tasty-image.component';

import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormValidatorsService } from '@app/auth/services/form-validators-service.service';
import { CustomButtonComponent } from '@app/shared/custom-components/custom-button/custom-button.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '@app/auth/services/authentication.service';
import { PasswordWithRulesComponent } from '@app/shared/custom-components/password-with-rules/password-with-rules.component';
import { ConfirmPasswordComponent } from '@app/shared/custom-components/confirm-password/confirm-password.component';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    CustomButtonComponent,
    RouterModule,
    GreenTastyImageComponent,
    PasswordWithRulesComponent,
    ConfirmPasswordComponent,
  ],

  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  private formBuilder = inject(FormBuilder);
  private formValidatorsService = inject(FormValidatorsService);
  private authenticationService = inject(AuthenticationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  unsuccessfulRegistration = false;
  registrationSuccessful = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.initRegisterForm();
  }

  initRegisterForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[A-Za-z'-]+$/),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[A-Za-z'-]+$/),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.maxLength(254),
            Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
          ],
        ],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: (control) => this.formValidatorsService.passwordMatchValidator(control) }
    );
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password') as FormControl;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword') as FormControl;
  }

  async onSubmit() {
    if (!this.registerForm.valid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const registerData = this.registerForm.value;
    const isDemoMode = this.route.snapshot.queryParamMap.has('demo');
    this.isSubmitting = true;
    this.unsuccessfulRegistration = false;
    this.errorMessage = null;

    try {
      const result = isDemoMode
        ? this.authenticationService.registerDemo(
            registerData.firstName,
            registerData.lastName,
            registerData.email
          )
        : await this.authenticationService.register(
            registerData.firstName,
            registerData.lastName,
            registerData.email,
            registerData.password,
            registerData.confirmPassword
          );
      this.unsuccessfulRegistration = !result.success;
      this.errorMessage = result.message || null;
      if (result.success) {
        if (isDemoMode || result.isDemo) {
          this.registrationSuccessful = true;
        } else {
          await this.router.navigate(['/login'], { queryParams: { registered: true } });
        }
      }
    } catch (error) {
      console.error('Registration failed unexpectedly.', error);
      this.unsuccessfulRegistration = true;
      this.errorMessage = 'Registration failed. Please try again later.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
