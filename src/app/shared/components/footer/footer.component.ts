import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="ep-footer">
      <div class="container">
        <div class="footer-grid">

          <!-- Brand -->
          <div class="footer-brand">
            <div class="ep-logo mb-4">
              <div class="logo-icon">
                <i class="fa-solid fa-calendar-check"></i>
                <span class="logo-dot"><i class="fa-solid fa-square-parking"></i></span>
              </div>
              <div>
                <span class="logo-name">Event<span class="logo-accent">Park</span></span>
                <div class="logo-tagline">Book Events and Parking in One Place</div>
              </div>
            </div>
            <p class="brand-desc">
              EventPark is a unified event and parking reservation platform — browse live events,
              pick your seats, and reserve a parking slot in one seamless booking flow.
            </p>
            <div class="social-row">
              <a href="javascript:void(0)" class="social-btn" title="GitHub"><i class="fa-brands fa-github"></i></a>
              <a href="javascript:void(0)" class="social-btn" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
              <a href="javascript:void(0)" class="social-btn" title="Twitter"><i class="fa-brands fa-twitter"></i></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h6 class="footer-col-title">Platform</h6>
            <ul class="footer-links">
              <li><a routerLink="/events">Browse Events</a></li>
              <li><a routerLink="/my-bookings">My Bookings</a></li>
              <li><a routerLink="/notifications">Notifications</a></li>
              <li><a routerLink="/profile">My Account</a></li>
              <li><a routerLink="/admin/dashboard"><i class="fa-solid fa-shield-halved me-1 text-primary"></i> Admin Portal</a></li>
            </ul>
          </div>

          <!-- Features -->
          <div>
            <h6 class="footer-col-title">Features</h6>
            <ul class="footer-links">
              <li><a href="javascript:void(0)">Visual Seat Map</a></li>
              <li><a href="javascript:void(0)">Parking Bay Booking</a></li>
              <li><a href="javascript:void(0)">Combined Booking</a></li>
              <li><a href="javascript:void(0)">Digital Tickets</a></li>
            </ul>
          </div>

          <!-- Status -->
          <div>
            <h6 class="footer-col-title">System Status</h6>
            <div class="status-card">
              <div class="status-row">
                <span class="status-dot"></span>
                <span class="status-label">All Systems Operational</span>
              </div>
              <p class="status-sub">Frontend & API running smoothly.</p>
              <div class="tech-badges">
                <span class="tech-badge">Angular 19</span>
                <span class="tech-badge">ASP.NET Core</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 EventPark. All rights reserved.</span>
          <span class="footer-legal">
            <a href="javascript:void(0)">Privacy Policy</a>
            <a href="javascript:void(0)">Terms of Service</a>
          </span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .ep-footer {
      background: #FFFFFF;
      border-top: 1px solid var(--border-subtle);
      margin-top: auto;
      padding: 3rem 0 0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2.2fr 1fr 1fr 1.5fr;
      gap: 3rem;
      padding-bottom: 2.5rem;
    }
    @media (max-width: 1024px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
    }
    @media (max-width: 576px) {
      .footer-grid { grid-template-columns: 1fr; gap: 1.5rem; }
    }

    /* Logo in footer */
    .ep-logo { display: flex; align-items: flex-start; gap: 0.6rem; }
    .logo-icon {
      position: relative;
      width: 36px;
      height: 36px;
      background: var(--primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 1rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .logo-dot {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      background: var(--accent);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.55rem;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
    }
    .logo-name { font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--text-main); line-height: 1; }
    .logo-accent { color: var(--primary); }
    .logo-tagline { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem; }

    .brand-desc {
      font-size: 0.875rem;
      color: var(--text-muted);
      line-height: 1.65;
      max-width: 340px;
      margin-bottom: 1.25rem;
    }

    .social-row { display: flex; gap: 0.5rem; }
    .social-btn {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.15s ease;
    }
    .social-btn:hover { color: var(--primary); border-color: var(--primary-subtle); background: var(--primary-light); }

    .footer-col-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-main);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 1rem;
    }

    .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .footer-links a { font-size: 0.875rem; color: var(--text-muted); transition: color 0.12s; }
    .footer-links a:hover { color: var(--primary); }

    .status-card {
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 0.875rem;
    }
    .status-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      flex-shrink: 0;
    }
    .status-label { font-size: 0.825rem; font-weight: 600; color: var(--text-main); }
    .status-sub { font-size: 0.775rem; color: var(--text-dim); margin-bottom: 0.75rem; }
    .tech-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .tech-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
    }

    .footer-bottom {
      border-top: 1px solid var(--border-subtle);
      padding: 1.25rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
      font-size: 0.8rem;
      color: var(--text-dim);
    }
    .footer-legal { display: flex; gap: 1.25rem; }
    .footer-legal a { color: var(--text-dim); font-size: 0.8rem; transition: color 0.12s; }
    .footer-legal a:hover { color: var(--primary); }
  `]
})
export class FooterComponent {}
