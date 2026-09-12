import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">

        <!-- Left: Brand Panel -->
        <div class="auth-brand-panel d-none d-lg-flex">
          <div class="brand-content">
            <div class="brand-badge mb-4">
              <i class="fa-solid fa-user-plus me-2"></i> Join EventPark Today
            </div>
            <h2 class="brand-headline">Your Next Event Experience Starts Here</h2>
            <p class="brand-sub">
              Create your free account and start booking event seats with guaranteed parking in minutes.
            </p>
            <div class="brand-steps">
              <div class="step-item">
                <div class="step-num">1</div>
                <div>
                  <strong>Create your account</strong>
                  <p>Sign up in less than 60 seconds, free forever.</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-num">2</div>
                <div>
                  <strong>Browse & book events</strong>
                  <p>Discover events and reserve your seat and parking.</p>
                </div>
              </div>
              <div class="step-item">
                <div class="step-num">3</div>
                <div>
                  <strong>Get your digital ticket</strong>
                  <p>Receive instant confirmation with QR entry pass.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Form Panel -->
        <div class="auth-form-panel">
          <div class="auth-form-inner">

            <div class="auth-header mb-4">
              <a routerLink="/" class="ep-logo mb-4 d-inline-flex">
                <div class="logo-icon">
                  <i class="fa-solid fa-calendar-check"></i>
                  <span class="logo-dot"><i class="fa-solid fa-square-parking"></i></span>
                </div>
                <span class="logo-name">Event<span class="logo-accent">Park</span></span>
              </a>
              <h1 class="auth-title">Create your account</h1>
              <p class="auth-sub">Join thousands of users booking events and parking on EventPark.</p>
            </div>

            @if (errorMessage()) {
              <div class="alert alert-danger mb-4">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">

              <!-- Full Name -->
              <div class="form-group mb-3">
                <label class="form-label" for="reg-name">Full Name</label>
                <div class="input-group">
                  <i class="fa-regular fa-user input-icon-left"></i>
                  <input
                    id="reg-name"
                    type="text"
                    class="form-control has-icon-left"
                    [class.is-invalid]="isFieldInvalid('name')"
                    formControlName="name"
                    placeholder="Your full name" />
                </div>
                @if (isFieldInvalid('name')) {
                  <div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Name must be at least 2 characters.</div>
                }
              </div>

              <!-- Email -->
              <div class="form-group mb-3">
                <label class="form-label" for="reg-email">Email Address</label>
                <div class="input-group">
                  <i class="fa-regular fa-envelope input-icon-left"></i>
                  <input
                    id="reg-email"
                    type="email"
                    class="form-control has-icon-left"
                    [class.is-invalid]="isFieldInvalid('email')"
                    formControlName="email"
                    placeholder="name@example.com" />
                </div>
                @if (isFieldInvalid('email')) {
                  <div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address.</div>
                }
              </div>

              <!-- Phone -->
              <div class="form-group mb-3">
                <label class="form-label" for="reg-phone">Phone Number</label>
                <div class="input-group">
                  <i class="fa-solid fa-phone input-icon-left"></i>
                  <input
                    id="reg-phone"
                    type="tel"
                    class="form-control has-icon-left"
                    [class.is-invalid]="isFieldInvalid('phone')"
                    formControlName="phone"
                    placeholder="+94 77 123 4567" />
                </div>
                @if (isFieldInvalid('phone')) {
                  <div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number.</div>
                }
              </div>

              <!-- Password -->
              <div class="form-group mb-3">
                <label class="form-label" for="reg-password">Password</label>
                <div class="input-group">
                  <i class="fa-solid fa-lock input-icon-left"></i>
                  <input
                    id="reg-password"
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control has-icon-left"
                    [class.is-invalid]="isFieldInvalid('password')"
                    formControlName="password"
                    placeholder="Minimum 6 characters" />
                  <button type="button" class="input-icon-right" (click)="showPassword = !showPassword" tabindex="-1">
                    <i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </button>
                </div>
                @if (isFieldInvalid('password')) {
                  <div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Password must be at least 6 characters.</div>
                }
              </div>

              <!-- Confirm Password -->
              <div class="form-group mb-4">
                <label class="form-label" for="reg-confirm">Confirm Password</label>
                <div class="input-group">
                  <i class="fa-solid fa-lock input-icon-left"></i>
                  <input
                    id="reg-confirm"
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control has-icon-left"
                    [class.is-invalid]="isFieldInvalid('confirmPassword') || (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched)"
                    formControlName="confirmPassword"
                    placeholder="Re-enter password" />
                </div>
                @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                  <div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Passwords do not match.</div>
                }
              </div>

              <button
                type="submit"
                id="register-submit"
                class="btn btn-primary w-100 btn-lg"
                [disabled]="loading() || registerForm.invalid">
                @if (loading()) {
                  <span class="spinner spinner-sm"></span> Creating account...
                } @else {
                  Create Account <i class="fa-solid fa-arrow-right"></i>
                }
              </button>
            </form>

            <div class="auth-footer-text">
              Already have an account?
              <a routerLink="/login" class="auth-link">Sign in</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-main);
      padding: 2rem 1rem;
    }
    .auth-container {
      display: flex;
      width: 100%;
      max-width: 1100px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      min-height: 640px;
    }

    /* Brand Panel (Left) */
    .auth-brand-panel {
      width: 400px;
      background: linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 50%, #99F6E4 100%);
      border-right: 1px solid var(--primary-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      flex-shrink: 0;
    }
    .brand-content { max-width: 320px; }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.875rem;
      background: rgba(15,118,110,0.1);
      color: var(--primary);
      border: 1px solid rgba(15,118,110,0.2);
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .brand-headline {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.25;
      margin-bottom: 0.75rem;
      letter-spacing: -0.5px;
    }
    .brand-sub { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 2rem; line-height: 1.65; }

    .brand-steps { display: flex; flex-direction: column; gap: 1.25rem; }
    .step-item { display: flex; align-items: flex-start; gap: 0.875rem; }
    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: #FFFFFF;
      font-size: 0.8rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .step-item strong { display: block; font-size: 0.875rem; color: var(--text-main); margin-bottom: 0.2rem; }
    .step-item p { font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; }

    /* Form Panel */
    .auth-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 2rem;
    }
    .auth-form-inner { width: 100%; max-width: 400px; }

    .ep-logo { display: inline-flex; align-items: center; gap: 0.6rem; text-decoration: none; }
    .logo-icon {
      position: relative;
      width: 34px;
      height: 34px;
      background: var(--primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 0.95rem;
    }
    .logo-dot {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 15px;
      height: 15px;
      background: var(--accent);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.5rem;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
    }
    .logo-name { font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--text-main); }
    .logo-accent { color: var(--primary); }

    .auth-title { font-size: 1.65rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.4rem; letter-spacing: -0.5px; }
    .auth-sub { font-size: 0.875rem; color: var(--text-muted); line-height: 1.55; }

    .w-100 { width: 100%; }
    .auth-footer-text { text-align: center; margin-top: 1.25rem; font-size: 0.875rem; color: var(--text-muted); }
    .auth-link { color: var(--primary); font-weight: 600; margin-left: 0.25rem; }
    .auth-link:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
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
        localStorage.setItem('eventpark_pending_verification_email', email);
        localStorage.setItem('venuego_pending_verification_email', email);
        localStorage.setItem('eventro_pending_verification_email', email);
        this.toastService.success('Account created! Please verify your email.');
        this.router.navigate(['/verify-email']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please check your details and try again.');
      }
    });
  }
}
