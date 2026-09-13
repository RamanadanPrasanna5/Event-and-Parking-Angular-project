import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LoadingSpinnerComponent, ErrorBannerComponent],
  template: `
    <div class="auth-page-wrapper d-flex align-items-center justify-content-center py-5">
      <div class="auth-card card glass-card p-4 p-md-5 text-center">
        <div class="auth-brand-icon mx-auto mb-3">
          <i class="fa-solid fa-envelope-open-text"></i>
        </div>
        <h2 class="auth-title mb-2">Email Verification</h2>
        <p class="auth-subtitle mb-4">Confirming your email address to activate your account</p>

        @if (verifying()) {
          <app-loading-spinner message="Verifying your token..."></app-loading-spinner>
        } @else if (verified()) {
          <div class="py-3">
            <div class="text-success mb-3" style="font-size: 3rem;">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 class="mb-2">Email Verified Successfully!</h3>
            <p class="text-muted mb-4">Your account is now fully active. You can now sign in and book event tickets.</p>
            <a routerLink="/login" class="btn btn-primary btn-lg">
              Sign In to Your Account <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
          </div>
        } @else {
          <app-error-banner
            [title]="'Verification Failed'"
            [message]="errorMessage()!"
            [retryable]="false">
          </app-error-banner>

          <div class="card p-3 mb-4 text-start" style="background: var(--bg-surface);">
            <label class="form-label" for="manualToken">Have a verification code / token?</label>
            <div class="d-flex gap-2">
              <input
                id="manualToken"
                type="text"
                class="form-control"
                [(ngModel)]="manualToken"
                placeholder="Paste verification token here" />
              <button class="btn btn-primary" [disabled]="!manualToken" (click)="verifyManualToken()">
                Verify
              </button>
            </div>
          </div>

          <div class="d-flex justify-content-center gap-3">
            <a routerLink="/login" class="btn btn-outline">Back to Sign In</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-page-wrapper { min-height: calc(100vh - 180px); }
    .auth-card { width: 100%; max-width: 500px; }
    .auth-brand-icon {
      width: 54px; height: 54px; border-radius: var(--radius-md);
      background: var(--primary-subtle); color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem; border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .auth-title { font-size: 1.75rem; font-weight: 800; }
    .auth-subtitle { font-size: 0.9rem; color: var(--text-muted); }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  verifying = signal<boolean>(false);
  verified = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  manualToken = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.executeVerification(token);
    } else {
      this.errorMessage.set('No verification token provided in the link. You can paste your token below.');
    }
  }

  verifyManualToken(): void {
    if (this.manualToken) {
      this.executeVerification(this.manualToken.trim());
    }
  }

  private executeVerification(token: string): void {
    this.verifying.set(true);
    this.errorMessage.set(null);

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.verifying.set(false);
        this.verified.set(true);
        this.toastService.success('Email verified successfully!');
      },
      error: (err) => {
        this.verifying.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid or expired verification token.');
      }
    });
  }
}
