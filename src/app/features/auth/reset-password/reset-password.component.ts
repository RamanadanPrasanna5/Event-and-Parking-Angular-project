import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const p = control.get('newPassword')?.value;
  const cp = control.get('confirmPassword')?.value;
  return p && cp && p !== cp ? { passwordMismatch: true } : null;
};

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ErrorBannerComponent],
  template: `
    <div class="auth-page-wrapper d-flex align-items-center justify-content-center py-5">
      <div class="auth-card card glass-card p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="auth-brand-icon mx-auto mb-3">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <h2 class="auth-title">Set New Password</h2>
          <p class="auth-subtitle">Enter your reset token and choose a secure new password</p>
        </div>

        @if (resetSuccess()) {
          <div class="card p-4 text-center border-success mb-4" style="background: rgba(16, 185, 129, 0.08);">
            <div class="text-success mb-3" style="font-size: 2.5rem;">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 class="mb-2">Password Reset Successful!</h3>
            <p class="mb-4">Your password has been updated. You can now sign in with your new credentials.</p>
            <a routerLink="/login" class="btn btn-primary w-100">
              Sign In Now <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
          </div>
        } @else {
          @if (errorMessage()) {
            <app-error-banner
              [title]="'Reset Error'"
              [message]="errorMessage()!"
              [retryable]="false">
            </app-error-banner>
          }

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
            <!-- Token -->
            <div class="form-group mb-3">
              <label class="form-label" for="token">Reset Token</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-ticket input-icon"></i>
                <input
                  id="token"
                  type="text"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('token')"
                  formControlName="token"
                  placeholder="Paste your reset token" />
              </div>
              @if (isFieldInvalid('token')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Reset token is required.
                </div>
              }
            </div>

            <!-- New Password -->
            <div class="form-group mb-3">
              <label class="form-label" for="newPassword">New Password</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock input-icon"></i>
                <input
                  id="newPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('newPassword')"
                  formControlName="newPassword"
                  placeholder="Minimum 6 characters" />
                <button
                  type="button"
                  class="password-toggle-btn"
                  (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
              @if (isFieldInvalid('newPassword')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Password must be at least 6 characters.
                </div>
              }
            </div>

            <!-- Confirm New Password -->
            <div class="form-group mb-3">
              <label class="form-label" for="confirmPassword">Confirm New Password</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock-open input-icon"></i>
                <input
                  id="confirmPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('confirmPassword') || (resetForm.hasError('passwordMismatch') && resetForm.get('confirmPassword')?.touched)"
                  formControlName="confirmPassword"
                  placeholder="Re-enter new password" />
              </div>
              @if (resetForm.hasError('passwordMismatch') && resetForm.get('confirmPassword')?.touched) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  Passwords do not match.
                </div>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg w-100 mt-3"
              [disabled]="loading() || resetForm.invalid">
              @if (loading()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i> Updating Password...
              } @else {
                Reset Password <i class="fa-solid fa-arrow-right ms-1"></i>
              }
            </button>
          </form>

          <div class="text-center mt-4 pt-3 border-top border-subtle">
            <a routerLink="/login" class="text-muted"><i class="fa-solid fa-arrow-left me-1"></i> Back to Sign In</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page-wrapper { min-height: calc(100vh - 180px); }
    .auth-card { width: 100%; max-width: 480px; }
    .auth-brand-icon {
      width: 54px; height: 54px; border-radius: var(--radius-md);
      background: var(--primary-subtle); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .auth-title { font-size: 1.75rem; font-weight: 800; }
    .auth-subtitle { font-size: 0.9rem; color: var(--text-muted); }
    .input-with-icon { position: relative; display: flex; align-items: center; }
    .input-icon { position: absolute; left: 1rem; color: var(--text-dim); font-size: 0.95rem; pointer-events: none; }
    .input-with-icon input { padding-left: 2.75rem; }
    .password-toggle-btn { position: absolute; right: 0.85rem; background: none; border: none; color: var(--text-dim); cursor: pointer; }
    .password-toggle-btn:hover { color: #fff; }
    .border-success { border: 1px solid rgba(16, 185, 129, 0.4) !important; border-radius: var(--radius-lg); }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  resetForm!: FormGroup;
  loading = signal<boolean>(false);
  resetSuccess = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = false;

  ngOnInit(): void {
    const tokenFromUrl = this.route.snapshot.queryParams['token'] || '';

    this.resetForm = this.fb.group(
      {
        token: [tokenFromUrl, [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordMatchValidator }
    );
  }

  isFieldInvalid(name: string): boolean {
    const c = this.resetForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { token, newPassword } = this.resetForm.value;

    this.authService.resetPassword({ token, newPassword }).subscribe({
      next: () => {
        this.loading.set(false);
        this.resetSuccess.set(true);
        this.toastService.success('Password reset successful! Please sign in with your new password.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid or expired reset token.');
      }
    });
  }
}
