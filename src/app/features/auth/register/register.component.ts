import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ErrorBannerComponent],
  template: `
    <div class="auth-page-wrapper d-flex align-items-center justify-content-center py-5">
      <div class="auth-card card p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="auth-brand-icon mx-auto mb-3">
            <i class="fa-solid fa-user-plus"></i>
          </div>
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Join Event Park to book event seats and parking bays</p>
        </div>

        @if (registrationSuccess()) {
          <div class="card p-4 text-center border-success mb-4" style="background: var(--primary-subtle);">
            <div class="text-primary mb-3" style="font-size: 2.5rem;">
              <i class="fa-solid fa-envelope-circle-check"></i>
            </div>
            <h3 class="mb-2 font-heading">Registration Successful!</h3>
            <p class="mb-4 text-muted">
              We have dispatched an activation link to <strong class="text-main">{{ registeredEmail() }}</strong>. Please check your inbox and verify your email before logging in.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <a routerLink="/login" class="btn btn-primary">
                Proceed to Sign In <i class="fa-solid fa-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        } @else {
          @if (errorMessage()) {
            <app-error-banner
              [title]="'Registration Error'"
              [message]="errorMessage()!"
              [retryable]="false">
            </app-error-banner>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Full Name -->
            <div class="form-group mb-3">
              <label class="form-label" for="name">Full Name</label>
              <div class="input-with-icon">
                <i class="fa-regular fa-user input-icon"></i>
                <input
                  id="name"
                  type="text"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('name')"
                  formControlName="name"
                  placeholder="John Doe" />
              </div>
              @if (isFieldInvalid('name')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Name is required (at least 2 characters).
                </div>
              }
            </div>

            <!-- Email Address -->
            <div class="form-group mb-3">
              <label class="form-label" for="email">Email Address</label>
              <div class="input-with-icon">
                <i class="fa-regular fa-envelope input-icon"></i>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('email')"
                  formControlName="email"
                  placeholder="name@example.com" />
              </div>
              @if (isFieldInvalid('email')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Please provide a valid email address.
                </div>
              }
            </div>

            <!-- Phone Number -->
            <div class="form-group mb-3">
              <label class="form-label" for="phone">Phone Number</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-phone input-icon"></i>
                <input
                  id="phone"
                  type="tel"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('phone')"
                  formControlName="phone"
                  placeholder="+94 77 123 4567" />
              </div>
              @if (isFieldInvalid('phone')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Please enter a valid phone number.
                </div>
              }
            </div>

            <!-- Password -->
            <div class="form-group mb-3">
              <label class="form-label" for="password">Password</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock input-icon"></i>
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('password')"
                  formControlName="password"
                  placeholder="Minimum 6 characters" />
                <button
                  type="button"
                  class="password-toggle-btn"
                  (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Password must be at least 6 characters.
                </div>
              }
            </div>

            <!-- Confirm Password -->
            <div class="form-group mb-3">
              <label class="form-label" for="confirmPassword">Confirm Password</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock-open input-icon"></i>
                <input
                  id="confirmPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('confirmPassword') || (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched)"
                  formControlName="confirmPassword"
                  placeholder="Re-enter password" />
              </div>
              @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Passwords do not match.
                </div>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg w-100 mt-3"
              [disabled]="loading() || registerForm.invalid">
              @if (loading()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...
              } @else {
                Create Account <i class="fa-solid fa-arrow-right ms-1"></i>
              }
            </button>
          </form>

          <div class="text-center mt-4 pt-3 border-top border-subtle">
            <p class="mb-0">
              Already have an account?
              <a routerLink="/login" class="font-bold text-primary">Sign in here</a>
            </p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page-wrapper {
      min-height: calc(100vh - 180px);
      font-family: var(--font-body);
    }
    .auth-card {
      width: 100%;
      max-width: 520px;
      border: 1px solid var(--border-medium);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    .auth-brand-icon {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-md);
      background: var(--primary-subtle);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      border: 1px solid var(--border-medium);
    }
    .auth-title {
      font-family: var(--font-heading);
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .auth-subtitle { font-size: 0.9rem; color: var(--text-muted); }
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 1rem; color: var(--text-dim); font-size: 0.95rem; pointer-events: none; }
    .input-with-icon input { padding-left: 2.75rem; }
    .password-toggle-btn { position: absolute; right: 0.85rem; background: none; border: none; color: var(--text-dim); cursor: pointer; }
    .password-toggle-btn:hover { color: var(--primary); }
    .border-success { border: 1px solid rgba(41, 73, 54, 0.35) !important; border-radius: var(--radius-lg); }
    .font-bold { font-weight: 700; }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  registerForm!: FormGroup;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  registrationSuccess = signal<boolean>(false);
  registeredEmail = signal<string>('');
  showPassword = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9+ \-()]{7,18}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { name, email, phone, password } = this.registerForm.value;

    this.authService.register({ name, email, phone, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.registeredEmail.set(email);
        this.registrationSuccess.set(true);
        this.toastService.success('Registration successful! Please verify your email.');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || err.error?.Message || 'Registration failed. Email may already be in use.';
        this.errorMessage.set(msg);
      }
    });
  }
}
