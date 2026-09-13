import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer-wrapper">
      <div class="container py-5">
        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand">
            <div class="brand-logo d-flex align-items-center gap-2 mb-3">
              <div class="brand-icon">
                <i class="fa-solid fa-ticket"></i>
              </div>
              <span class="brand-text">EVENT<span class="brand-text-accent">PARK</span></span>
            </div>
            <p class="footer-tagline">
              The premier unified platform for reserving event seats and parking bays with real-time interactive visual maps.
            </p>
            <div class="social-links d-flex gap-2 mt-4">
              <a href="javascript:void(0)" class="social-btn" aria-label="Github"><i class="fa-brands fa-github"></i></a>
              <a href="javascript:void(0)" class="social-btn" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
              <a href="javascript:void(0)" class="social-btn" aria-label="Twitter"><i class="fa-brands fa-twitter"></i></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-col">
            <h5 class="col-title">Navigation</h5>
            <ul class="footer-links">
              <li><a routerLink="/events">Browse Events</a></li>
              <li><a routerLink="/reservations/my-reservations">My Reservations</a></li>
              <li><a routerLink="/profile">Account Settings</a></li>
              <li><a routerLink="/admin">Admin Dashboard</a></li>
            </ul>
          </div>

          <!-- Platform Highlights -->
          <div class="footer-col">
            <h5 class="col-title">Features</h5>
            <ul class="footer-links">
              <li><a href="javascript:void(0)">Visual Seat Map Selection</a></li>
              <li><a href="javascript:void(0)">Integrated Parking Slot Bay</a></li>
              <li><a href="javascript:void(0)">15-Minute Guaranteed Hold</a></li>
              <li><a href="javascript:void(0)">Simulated Fast Checkout</a></li>
            </ul>
          </div>

          <!-- API & System Status -->
          <div class="footer-col">
            <h5 class="col-title">System Status</h5>
            <div class="status-card p-3">
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="status-dot"></span>
                <span class="status-text">Backend API Active</span>
              </div>
              <p class="status-subtext mb-0">Connected to ASP.NET Core Web API on port 7102.</p>
            </div>
          </div>
        </div>

        <div class="footer-divider my-4"></div>

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 footer-bottom">
          <small class="copy-text">&copy; 2026 EventPark — Event & Parking Reservation System. All rights reserved.</small>
          <div class="d-flex align-items-center gap-3">
            <div class="theme-pill-group">
              <button
                type="button"
                class="theme-pill-btn"
                [class.active]="themeService.isDark()"
                (click)="themeService.setTheme('dark')"
                title="Switch to Dark Mode">
                <i class="fa-solid fa-moon"></i> Dark
              </button>
              <button
                type="button"
                class="theme-pill-btn"
                [class.active]="themeService.isLight()"
                (click)="themeService.setTheme('light')"
                title="Switch to Light Mode">
                <i class="fa-solid fa-sun"></i> Light
              </button>
            </div>
            <small class="text-dim">Built with Angular 19 & ASP.NET Core</small>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background: #050E1A;
      color: #E2E8F0;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin-top: auto;
      font-family: var(--font-body);
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 3rem;
    }
    @media (max-width: 992px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }
    @media (max-width: 576px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }
    }
    .brand-logo {
      font-family: var(--font-heading);
      font-size: 1.45rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #FFFFFF;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, #6C7CFF 0%, #A855F7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 1rem;
      box-shadow: 0 4px 14px rgba(108, 124, 255, 0.4);
    }
    .brand-text-accent {
      background: linear-gradient(135deg, #6C7CFF 0%, #EC4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-left: 2px;
    }
    .footer-tagline {
      font-size: 0.885rem;
      line-height: 1.65;
      max-width: 320px;
      color: #94A3B8;
    }
    .social-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .social-btn:hover {
      color: #FFFFFF;
      border-color: #6C7CFF;
      background: rgba(108, 124, 255, 0.2);
      transform: translateY(-2px);
    }
    .col-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 1.25rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .footer-links a {
      color: #94A3B8;
      font-size: 0.885rem;
      transition: all var(--transition-fast);
      text-decoration: none;
    }
    .footer-links a:hover {
      color: #22D3EE;
      padding-left: 4px;
    }
    .status-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.10);
      border-radius: var(--radius-md);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.7);
    }
    .status-text {
      font-size: 0.85rem;
      font-weight: 600;
      color: #FFFFFF;
    }
    .status-subtext {
      font-size: 0.775rem;
      color: #94A3B8;
    }
    .footer-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
    }
    .footer-bottom {
      font-size: 0.825rem;
      color: #94A3B8;
    }
    .copy-text {
      color: #94A3B8;
    }
    .theme-pill-group {
      display: flex;
      align-items: center;
      background: rgba(0, 0, 0, 0.45);
      padding: 3px;
      border-radius: var(--radius-pill);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .theme-pill-btn {
      border: none;
      background: transparent;
      color: #94A3B8;
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      font-size: 0.775rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .theme-pill-btn.active {
      background: var(--primary);
      color: #FFFFFF;
      font-weight: 600;
    }
    .text-dim {
      color: #64748B;
    }
  `]
})
export class FooterComponent {
  themeService = inject(ThemeService);
}
