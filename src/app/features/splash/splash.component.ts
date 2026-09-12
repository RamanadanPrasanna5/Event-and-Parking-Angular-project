import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="splash-screen">
      <div class="splash-content">
        <!-- Logo -->
        <div class="splash-logo">
          <div class="splash-logo-icon">
            <i class="fa-solid fa-calendar-check"></i>
            <span class="splash-logo-dot"><i class="fa-solid fa-square-parking"></i></span>
          </div>
          <div class="splash-brand">
            <div class="splash-name">Event<span>Park</span></div>
            <div class="splash-tagline">Book Events and Parking in One Place</div>
          </div>
        </div>

        <!-- Loading -->
        <div class="splash-loader">
          <div class="loader-bar">
            <div class="loader-fill"></div>
          </div>
          <p class="loader-text">Loading EventPark...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .splash-screen {
      position: fixed;
      inset: 0;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .splash-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3rem;
    }
    .splash-logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .splash-logo-icon {
      position: relative;
      width: 64px;
      height: 64px;
      background: var(--primary);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 1.75rem;
      box-shadow: 0 8px 24px rgba(15, 118, 110, 0.3);
      animation: pulse 2s ease infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 8px 24px rgba(15, 118, 110, 0.3); }
      50% { transform: scale(1.04); box-shadow: 0 12px 32px rgba(15, 118, 110, 0.4); }
    }
    .splash-logo-dot {
      position: absolute;
      bottom: -6px;
      right: -6px;
      width: 24px;
      height: 24px;
      background: var(--accent);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: #FFFFFF;
      border: 3px solid #FFFFFF;
    }
    .splash-name {
      font-family: var(--font-heading);
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1;
      letter-spacing: -1px;
    }
    .splash-name span { color: var(--primary); }
    .splash-tagline {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
    }
    .splash-loader { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .loader-bar {
      width: 200px;
      height: 3px;
      background: var(--border-subtle);
      border-radius: 2px;
      overflow: hidden;
    }
    .loader-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 2px;
      animation: load 1.8s ease-in-out infinite;
    }
    @keyframes load {
      0% { width: 0%; margin-left: 0; }
      50% { width: 80%; margin-left: 0; }
      100% { width: 0%; margin-left: 100%; }
    }
    .loader-text { font-size: 0.8rem; color: var(--text-dim); font-weight: 500; }
  `]
})
export class SplashComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => {
      if (this.authService.isLoggedIn()) {
        const user = this.authService.currentUser();
        if (user?.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/customer/home']);
        }
      } else {
        this.router.navigate(['/']);
      }
    }, 1800);
  }
}
