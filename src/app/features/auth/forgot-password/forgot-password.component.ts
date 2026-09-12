import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">

        <!-- Left: Form Panel -->
        <div class="auth-form-panel">
          <div class="auth-form-inner">

            <!-- Header -->
            <div class="auth-header mb-4">
              <a routerLink="/" class="ep-logo mb-4 d-inline-flex">
                <div class="logo-icon">
                  <i class="fa-solid fa-calendar-check"></i>
                  <span class="logo-dot"><i class="fa-solid fa-square-parking"></i></span>
                </div>
                <span class="logo-name">Event<span class="logo-accent">Park</span></span>
              </a>
              <h1 class="auth-title">Forgot Password?</h1>
              <p class="auth-sub">
                No worries! Enter your registered email address and we'll send you instructions to reset your password.
              </p>
            </div>

            <!-- Error Banner -->
            @if (errorMessage()) {
              <div class="alert alert-danger mb-4">
                <i class="fa-solid fa-circle-exclamation me-2"></i>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Form -->
            <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
              <div class="form-group mb-4">
                <label class="form-label" for="email">Email Address</label>
                <div class="input-group">
                  <i class="fa-regular fa-envelope input-icon-left"></i>
                  <input
                    id="email"
                    type="email"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('email')"
                    formControlName="email"
                    placeholder="name@example.com" />
                </div>
                @if (isFieldInvalid('email')) {
                  <div class="form-error mt-1">
                    <i class="fa-solid fa-circle-exclamation me-1"></i>
                    Please enter a valid email address.
                  </div>
                }
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-100"
                [disabled]="loading() || forgotForm.invalid">
                @if (loading()) {
                  <i class="fa-solid fa-circle-notch fa-spin me-2"></i> Sending Link...
                } @else {
                  <span>Send Reset Link</span>
                  <i class="fa-solid fa-arrow-right ms-2"></i>
                }
              </button>
            </form>

            <div class="auth-footer-text mt-4 pt-3 border-top border-subtle text-center">
              <span class="text-muted">Remember your password?</span>
              <a routerLink="/login" class="auth-link ms-1">
                <i class="fa-solid fa-arrow-left me-1"></i> Back to Sign In
              </a>
            </div>

          </div>
        </div>

        <!-- Right: Brand Panel -->
        <div class="auth-brand-panel d-none d-lg-flex">
          <div class="brand-content">
            <div class="brand-badge mb-4">
              <i class="fa-solid fa-shield-halved me-2"></i> Account Protection
            </div>
            <h2 class="brand-headline">Fast & Secure Account Recovery</h2>
            <p class="brand-sub">
              Your reservations, tickets, and payment information remain safe with EventPark's end-to-end encryption.
            </p>

            <div class="brand-features">
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-bolt"></i></div>
                <div>
                  <strong>Instant Reset Token</strong>
                  <p>Get a quick verification link sent straight to your email.</p>
                </div>
              </div>
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-ticket"></i></div>
                <div>
                  <strong>Preserve Reservations</strong>
                  <p>All your ongoing seat holds and parking slots stay attached to your profile.</p>
                </div>
              </div>
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-headset"></i></div>
                <div>
                  <strong>Need Assistance?</strong>
                  <p>Our 24/7 support team is available if you no longer have email access.</p>
                </div>
              </div>
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
      align-items: stretch;
      background: var(--bg-main);
    }
    .auth-container {
      display: flex;
      width: 100%;
      max-width: 1100px;
      margin: auto;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      min-height: 560px;
      align-self: center;
    }
    @media (max-width: 768px) {
      .auth-page { align-items: flex-start; padding: 1rem; }
      .auth-container { border-radius: var(--radius-lg); }
    }

    /* Form Panel */
    .auth-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 2rem;
    }
    .auth-form-inner { width: 100%; max-width: 400px; }

    /* Logo */
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

    .auth-title { font-size: 1.75rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.4rem; letter-spacing: -0.5px; }
    .auth-sub { font-size: 0.9rem; color: var(--text-muted); line-height: 1.55; }

    .input-group {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon-left {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      font-size: 0.95rem;
      pointer-events: none;
      z-index: 2;
    }
    .input-group .form-control {
      padding-left: 2.75rem;
      width: 100%;
    }

    .form-error {
      font-size: 0.8rem;
      color: var(--danger);
      display: flex;
      align-items: center;
    }

    .w-100 { width: 100%; }

    .auth-footer-text {
      font-size: 0.875rem;
    }
    .auth-link {
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
    }
    .auth-link:hover { text-decoration: underline; }

    /* Brand Panel */
    .auth-brand-panel {
      width: 420px;
      background: linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 50%, #99F6E4 100%);
      border-left: 1px solid var(--primary-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      flex-shrink: 0;
    }
    .brand-content { max-width: 340px; }
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
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.25;
      margin-bottom: 0.75rem;
      letter-spacing: -0.5px;
    }
    .brand-sub { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem; line-height: 1.65; }
    .brand-features { display: flex; flex-direction: column; gap: 1.25rem; }
    .brand-feature { display: flex; align-items: flex-start; gap: 0.875rem; }
    .bf-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: rgba(15,118,110,0.12);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .brand-feature strong { display: block; font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.2rem; }
    .brand-feature p { font-size: 0.825rem; color: var(--text-muted); line-height: 1.5; }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  forgotForm: FormGroup = this.fb.group({
    email: ['john.perera@example.com', [Validators.required, Validators.email]]
  });

  loading = signal<boolean>(false);
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
        this.toastService.success('Reset link sent! Please create a new password.', 'Success');
        this.router.navigate(['/reset-password']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Failed to send reset link. Please verify your email.');
      }
    });
  }
}
