import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ErrorBannerComponent],
  template: `
    <div class="auth-page-wrapper d-flex align-items-center justify-content-center py-5">
      <div class="auth-card card glass-card p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="auth-brand-icon mx-auto mb-3">
            <i class="fa-solid fa-key"></i>
          </div>
          <h2 class="auth-title">Reset Password</h2>
          <p class="auth-subtitle">Enter your registered email and we'll send you a password reset token</p>
        </div>

        @if (submitted()) {
          <div class="card p-4 text-center border-success mb-4" style="background: rgba(16, 185, 129, 0.08);">
            <div class="text-success mb-3" style="font-size: 2.5rem;">
              <i class="fa-solid fa-paper-plane"></i>
            </div>
            <h3 class="mb-2">Instructions Dispatched</h3>
            <p class="mb-4">
              If an account with that email exists, we've sent reset instructions. Please check your email or proceed to the reset page if you have your token.
            </p>
            <div class="d-flex flex-column gap-2">
              <a routerLink="/reset-password" class="btn btn-primary">
                Enter Reset Token & New Password
              </a>
              <a routerLink="/login" class="btn btn-outline">
                Back to Sign In
              </a>
            </div>
          </div>
        } @else {
          @if (errorMessage()) {
            <app-error-banner
              [title]="'Request Failed'"
              [message]="errorMessage()!"
              [retryable]="false">
            </app-error-banner>
          }

          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
            <div class="form-group mb-3">
              <label class="form-label" for="email">Account Email Address</label>
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
                  Please enter a valid email address.
                </div>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg w-100 mt-3"
              [disabled]="loading() || forgotForm.invalid">
              @if (loading()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i> Sending Link...
              } @else {
                Send Reset Link <i class="fa-solid fa-arrow-right ms-1"></i>
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
    .border-success { border: 1px solid rgba(16, 185, 129, 0.4) !important; border-radius: var(--radius-lg); }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  isFieldInvalid(name: string): boolean {
    const c = this.forgotForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
        this.toastService.success('If an account exists, a reset link has been sent.');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to send reset link.');
      }
    });
  }
}
