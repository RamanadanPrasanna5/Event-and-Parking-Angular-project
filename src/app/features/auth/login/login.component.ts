import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">

        <!-- Left: Form Panel -->
        <div class="auth-form-panel">
          <div class="auth-form-inner">

            <!-- Header -->
            <div class="auth-header mb-5">
              <a routerLink="/" class="ep-logo mb-4 d-inline-flex">
                <div class="logo-icon">
                  <i class="fa-solid fa-calendar-check"></i>
                  <span class="logo-dot"><i class="fa-solid fa-square-parking"></i></span>
                </div>
                <span class="logo-name">Event<span class="logo-accent">Park</span></span>
              </a>
              <h1 class="auth-title">Welcome back</h1>
              <p class="auth-sub">Sign in to your EventPark account to manage bookings and parking.</p>
            </div>

            <!-- Error Banner -->
            @if (errorMessage()) {
              <div class="alert alert-danger mb-4">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>{{ errorMessage() }}</span>
              </div>
            }



            <!-- Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="form-group mb-4">
                <label class="form-label" for="login-email">Email Address</label>
                <div class="input-group">
                  <i class="fa-regular fa-envelope input-icon-left"></i>
                  <input
                    id="login-email"
                    type="email"
                    class="form-control has-icon-left"
                    [class.is-invalid]="isFieldInvalid('email')"
                    formControlName="email"
                    placeholder="name@example.com"
                    autocomplete="email" />
                </div>
                @if (isFieldInvalid('email')) {
                  <div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email.</div>
                }
              </div>

              <div class="form-group mb-5">
                <div class="d-flex justify-content-between align-items-center">
                  <label class="form-label mb-0" for="login-password">Password</label>
                  <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
                </div>
                <div class="input-group mt-1">
                  <i class="fa-solid fa-lock input-icon-left"></i>
                  <input
                    id="login-password"
                    [type]="showPassword ? 'text' : 'password'"
                    class="form-control has-icon-left"
                    [class.is-invalid]="isFieldInvalid('password')"
                    formControlName="password"
                    placeholder="••••••••"
                    autocomplete="current-password" />
                  <button type="button" class="input-icon-right" (click)="showPassword = !showPassword" tabindex="-1">
                    <i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </button>
                </div>
                @if (isFieldInvalid('password')) {
                  <div class="form-error"><i class="fa-solid fa-circle-exclamation"></i> Password is required.</div>
                }
              </div>

              <button
                type="submit"
                id="login-submit"
                class="btn btn-primary w-100 btn-lg"
                [disabled]="loading() || loginForm.invalid">
                @if (loading()) {
                  <span class="spinner spinner-sm"></span> Signing in...
                } @else {
                  Sign in <i class="fa-solid fa-arrow-right"></i>
                }
              </button>
            </form>

            <div class="auth-footer-text">
              Don't have an account?
              <a routerLink="/register" class="auth-link">Create one free</a>
            </div>
          </div>
        </div>

        <!-- Right: Brand Panel -->
        <div class="auth-brand-panel d-none d-lg-flex">
          <div class="brand-content">
            <div class="brand-badge mb-4">
              <i class="fa-solid fa-shield-check me-2"></i> Trusted Booking Platform
            </div>
            <h2 class="brand-headline">Book Events & Parking in One Place</h2>
            <p class="brand-sub">
              EventPark brings your seat reservation and vehicle parking into a single seamless booking flow.
            </p>
            <div class="brand-features">
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-regular fa-calendar-check"></i></div>
                <div>
                  <strong>Live Event Discovery</strong>
                  <p>Browse upcoming events with real-time seat availability.</p>
                </div>
              </div>
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-couch"></i></div>
                <div>
                  <strong>Visual Seat Selection</strong>
                  <p>Pick your exact seat from an interactive venue map.</p>
                </div>
              </div>
              <div class="brand-feature">
                <div class="bf-icon"><i class="fa-solid fa-square-parking"></i></div>
                <div>
                  <strong>Guaranteed Parking</strong>
                  <p>Reserve a dedicated parking slot alongside your event booking.</p>
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
      min-height: 600px;
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

    /* Demo */
    .demo-card {
      padding: 0.875rem 1rem;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
    .demo-title { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.6rem; }

    .forgot-link { font-size: 0.825rem; color: var(--primary); font-weight: 500; }
    .forgot-link:hover { text-decoration: underline; }

    .w-100 { width: 100%; }

    .auth-footer-text {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    .auth-link { color: var(--primary); font-weight: 600; margin-left: 0.25rem; }
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
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  showPassword = false;

  ngOnInit(): void {
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

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Welcome back to EventPark!', 'Signed In');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }
        const user = this.authService.currentUser();
        if (user?.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/customer/home']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password. Please try again.');
      }
    });
  }
}
