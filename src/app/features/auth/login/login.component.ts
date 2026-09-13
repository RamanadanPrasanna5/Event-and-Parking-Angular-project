import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ErrorBannerComponent],
  template: `
    <div class="auth-page-wrapper d-flex align-items-center justify-content-center py-5">
      <div class="auth-card card p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="auth-brand-icon mx-auto mb-3">
            <i class="fa-solid fa-arrow-right-to-bracket"></i>
          </div>
          <h2 class="auth-title">Welcome Back</h2>
          <p class="auth-subtitle">Sign in to your Event Park account to manage bookings</p>
        </div>

        @if (errorMessage()) {
          <app-error-banner
            [title]="errorTitle()"
            [message]="errorMessage()!"
            [retryable]="false">
          </app-error-banner>
        }

        @if (showResendVerification()) {
          <div class="alert-box warning p-3 mb-4 d-flex justify-content-between align-items-center">
            <div>
              <strong class="d-block mb-1">Email Not Verified</strong>
              <small>Need a new activation link?</small>
            </div>
            <button
              class="btn btn-sm btn-secondary"
              [disabled]="resendingEmail()"
              (click)="resendVerification()">
              @if (resendingEmail()) {
                <i class="fa-solid fa-spinner fa-spin"></i> Sending...
              } @else {
                Resend Link
              }
            </button>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
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
                placeholder="name@example.com"
                autocomplete="email" />
            </div>
            @if (isFieldInvalid('email')) {
              <div class="form-error">
                <i class="fa-solid fa-circle-exclamation"></i>
                Please enter a valid email address.
              </div>
            }
          </div>

          <div class="form-group mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label mb-0" for="password">Password</label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>
            <div class="input-with-icon">
              <i class="fa-solid fa-lock input-icon"></i>
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('password')"
                formControlName="password"
                placeholder="••••••••"
                autocomplete="current-password" />
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
                Password is required.
              </div>
            }
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg w-100 mt-3"
            [disabled]="loading() || loginForm.invalid">
            @if (loading()) {
              <i class="fa-solid fa-circle-notch fa-spin"></i> Signing In...
            } @else {
              Sign In <i class="fa-solid fa-arrow-right ms-1"></i>
            }
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top border-subtle">
          <p class="mb-0">
            Don't have an account?
            <a routerLink="/register" class="font-bold text-primary">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-wrapper {
      min-height: calc(100vh - 180px);
      font-family: var(--font-sans);
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
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
    .auth-subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-dim);
      font-size: 0.95rem;
      pointer-events: none;
    }
    .input-with-icon input {
      padding-left: 2.75rem;
    }
    .password-toggle-btn {
      position: absolute;
      right: 0.85rem;
      background: none;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
    }
    .password-toggle-btn:hover {
      color: var(--primary);
    }
    .forgot-link {
      font-size: 0.825rem;
      color: var(--text-muted);
      text-decoration: none;
    }
    .forgot-link:hover {
      color: var(--primary);
    }
    .alert-box.warning {
      background: var(--accent-subtle);
      border: 1px solid rgba(181, 154, 91, 0.4);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 0.85rem;
    }
    .font-bold { font-weight: 700; }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  errorTitle = signal<string>('Sign In Failed');
  showResendVerification = signal<boolean>(false);
  resendingEmail = signal<boolean>(false);
  showPassword = false;

  private returnUrl: string = '/events';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/events';

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.showResendVerification.set(false);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Welcome back to Event Park!', 'Signed In');

        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const serverMsg = err.error?.message || err.error?.Message || 'Invalid email or password.';
        this.errorMessage.set(serverMsg);

        if (serverMsg.toLowerCase().includes('verify your email')) {
          this.errorTitle.set('Unverified Email');
          this.showResendVerification.set(true);
        }
      }
    });
  }

  resendVerification(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.toastService.warning('Please enter your registered email address.');
      return;
    }

    this.resendingEmail.set(true);
    this.authService.resendVerification({ email }).subscribe({
      next: (res) => {
        this.resendingEmail.set(false);
        this.toastService.success(res.message || 'Verification link sent! Check your inbox.');
        this.showResendVerification.set(false);
      },
      error: (err) => {
        this.resendingEmail.set(false);
        this.toastService.error(err.error?.message || 'Failed to resend verification email.');
      }
    });
  }
}
