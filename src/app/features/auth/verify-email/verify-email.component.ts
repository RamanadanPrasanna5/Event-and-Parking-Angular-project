import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
              <h1 class="auth-title">Verify Your Email</h1>
              <p class="auth-sub">
                Enter the verification token sent to your email to activate your account.
              </p>
            </div>

            <!-- Pending Email Display -->
            @if (pendingEmail) {
              <div class="email-badge p-3 mb-4 rounded d-flex align-items-center gap-2">
                <div class="email-badge-icon">
                  <i class="fa-regular fa-envelope"></i>
                </div>
                <div>
                  <small class="text-muted d-block text-uppercase text-xs">Sent to</small>
                  <strong class="text-main">{{ pendingEmail }}</strong>
                </div>
              </div>
            }

            <!-- Token Input Form -->
            <div class="form-group mb-4">
              <label class="form-label" for="tokenInput">Verification Code / Token</label>
              <div class="input-group">
                <i class="fa-solid fa-shield-halved input-icon-left"></i>
                <input
                  id="tokenInput"
                  type="text"
                  class="form-control font-mono"
                  [(ngModel)]="token"
                  placeholder="Paste your token here..." />
              </div>
              <small class="text-muted mt-1 d-block">Check your inbox or spam folder for the code.</small>
            </div>

            <div class="d-flex flex-column gap-3 mb-4">
              <button
                type="button"
                class="btn btn-primary btn-lg w-100"
                [disabled]="verifying() || !token.trim()"
                (click)="onVerifyEmail()">
                @if (verifying()) {
                  <i class="fa-solid fa-circle-notch fa-spin me-2"></i> Verifying...
                } @else {
                  <i class="fa-solid fa-circle-check me-2"></i> Complete Verification
                }
              </button>

              <button
                type="button"
                class="btn btn-secondary w-100"
                [disabled]="resending() || !pendingEmail"
                (click)="onResendEmail()">
                @if (resending()) {
                  <i class="fa-solid fa-spinner fa-spin me-2"></i> Sending...
                } @else {
                  <i class="fa-solid fa-arrow-rotate-right me-2"></i> Resend Verification Email
                }
              </button>
            </div>

            <div class="auth-footer-text mt-4 pt-3 border-top border-subtle text-center">
              <span class="text-muted">Already verified?</span>
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
              <i class="fa-solid fa-envelope-circle-check me-2"></i> Email Confirmation
            </div>
            <h2 class="brand-headline">One Quick Step to Get Started</h2>
            <p class="brand-sub">
              Verifying your email ensures instant booking confirmations, digital QR passes, and ticket release notifications.
            </p>

            <div class="brand-features">
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-qrcode"></i></div>
                <div>
                  <strong>Instant Gate Passes</strong>
                  <p>Get mobile-ready digital barcodes delivered straight to your verified email.</p>
                </div>
              </div>
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-square-parking"></i></div>
                <div>
                  <strong>Guaranteed Parking Bays</strong>
                  <p>Reserve synchronized parking bays without fear of losing your slot.</p>
                </div>
              </div>
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-bell"></i></div>
                <div>
                  <strong>Live Updates</strong>
                  <p>Receive real-time notifications if event times or venue gates change.</p>
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
      min-height: 580px;
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

    .email-badge {
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
    }
    .email-badge-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .text-xs { font-size: 0.725rem; }

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
    .font-mono { font-family: monospace; letter-spacing: 0.5px; }

    .w-100 { width: 100%; }

    .auth-footer-text { font-size: 0.875rem; }
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
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  token: string = '';
  verifying = signal<boolean>(false);
  resending = signal<boolean>(false);
  pendingEmail: string | null = null;

  ngOnInit(): void {
    this.pendingEmail = localStorage.getItem('eventpark_pending_verification_email') ||
      localStorage.getItem('venuego_pending_verification_email') ||
      localStorage.getItem('eventro_pending_verification_email') ||
      null;
    const urlToken = this.route.snapshot.queryParamMap.get('token');
    if (urlToken) {
      this.token = urlToken;
      this.onVerifyEmail();
    }
  }

  onVerifyEmail(): void {
    if (!this.token.trim()) {
      this.toastService.warning('Please enter a verification token.');
      return;
    }

    this.verifying.set(true);
    this.authService.verifyEmail(this.token.trim()).subscribe({
      next: () => {
        this.verifying.set(false);
        this.toastService.success('Email verified successfully! Please sign in to continue.', 'Verified');
        localStorage.removeItem('eventpark_pending_verification_email');
        localStorage.removeItem('venuego_pending_verification_email');
        localStorage.removeItem('eventro_pending_verification_email');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.verifying.set(false);
        this.toastService.error(err.error?.message || 'Verification failed. Token may be invalid or expired.');
      }
    });
  }

  onResendEmail(): void {
    if (!this.pendingEmail) {
      this.toastService.warning('No email address found to resend verification.');
      return;
    }

    this.resending.set(true);
    this.authService.resendVerification({ email: this.pendingEmail }).subscribe({
      next: (res) => {
        this.resending.set(false);
        this.toastService.info(res.message || 'Verification email resent! Check your inbox.');
      },
      error: (err) => {
        this.resending.set(false);
        this.toastService.error(err.error?.message || 'Failed to resend verification email.');
      }
    });
  }
}
