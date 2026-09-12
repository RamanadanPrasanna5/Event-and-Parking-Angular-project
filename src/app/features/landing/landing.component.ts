import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { AuthService } from '../../core/services/auth.service';
import { EventDto } from '../../core/models/event.model';
import { EventCardComponent } from '../events/event-card/event-card.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, EventCardComponent, LoadingComponent],
  template: `
    <div class="landing-wrapper">

      <!-- ===================== HERO ===================== -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-inner">

            <!-- Left: Text Content -->
            <div class="hero-content">
              <div class="hero-badge mb-4">
                <span class="badge-pulse"></span>
                Live Events & Parking — All in One Place
              </div>

              <h1 class="hero-title mb-4">
                Book Events and<br>Parking in <span class="highlight">One Place</span>
              </h1>

              <p class="hero-desc mb-5">
                Browse upcoming events, reserve your exact seats, and book a dedicated parking
                slot in a single seamless checkout flow.
              </p>

              <div class="hero-actions mb-5">
                <a routerLink="/events" class="btn btn-primary btn-lg">
                  <i class="fa-regular fa-compass"></i> Explore Events
                </a>
                @if (!authService.isLoggedIn()) {
                  <a routerLink="/register" class="btn btn-secondary btn-lg">
                    Get Started Free
                  </a>
                } @else {
                  <a routerLink="/customer/home" class="btn btn-secondary btn-lg">
                    <i class="fa-solid fa-gauge"></i> My Dashboard
                  </a>
                }
              </div>

              <!-- Trust Row -->
              <div class="trust-row">
                <div class="trust-item">
                  <i class="fa-solid fa-shield-check text-primary"></i>
                  <span>Secure Checkout</span>
                </div>
                <div class="trust-sep">·</div>
                <div class="trust-item">
                  <i class="fa-solid fa-bolt text-primary"></i>
                  <span>Instant Confirmation</span>
                </div>
                <div class="trust-sep">·</div>
                <div class="trust-item">
                  <i class="fa-solid fa-square-parking text-primary"></i>
                  <span>Guaranteed Parking</span>
                </div>
              </div>
            </div>

            <!-- Right: Visual Cards -->
            <div class="hero-visual d-none d-lg-flex">
              <div class="visual-card visual-card-1">
                <div class="vc-icon"><i class="fa-regular fa-calendar-check"></i></div>
                <div class="vc-body">
                  <span class="vc-tag">UPCOMING</span>
                  <strong>Live Events</strong>
                  <small>Browse & book seats</small>
                </div>
              </div>
              <div class="visual-card visual-card-2">
                <div class="vc-icon" style="background:#F0FDFA;color:var(--primary)"><i class="fa-solid fa-couch"></i></div>
                <div class="vc-body">
                  <span class="vc-tag">INTERACTIVE</span>
                  <strong>Seat Selection</strong>
                  <small>Pick your exact spot</small>
                </div>
              </div>
              <div class="visual-card visual-card-3">
                <div class="vc-icon" style="background:#FFFBEB;color:#D97706"><i class="fa-solid fa-square-parking"></i></div>
                <div class="vc-body">
                  <span class="vc-tag">RESERVED</span>
                  <strong>Parking Slot</strong>
                  <small>Guaranteed bay</small>
                </div>
              </div>
              <div class="visual-card visual-card-4">
                <div class="vc-icon" style="background:#F0FDF4;color:#16A34A"><i class="fa-solid fa-qrcode"></i></div>
                <div class="vc-body">
                  <span class="vc-tag">INSTANT</span>
                  <strong>Digital Ticket</strong>
                  <small>QR entry pass</small>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ===================== UPCOMING EVENTS ===================== -->
      <section class="section-pad">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="section-label mb-2">Happening Soon</div>
              <h2 class="section-title">Upcoming Events</h2>
              <p class="section-subtitle">Discover upcoming events and reserve your seat with parking.</p>
            </div>
            <a routerLink="/events" class="btn btn-secondary btn-sm">
              View All Events <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          @if (loading()) {
            <app-loading message="Loading events..."></app-loading>
          } @else if (upcomingEvents().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="fa-regular fa-calendar"></i></div>
              <p class="empty-title">No upcoming events</p>
              <p class="empty-text">Check back soon for new events added by our admin team.</p>
            </div>
          } @else {
            <div class="grid grid-cols-3 gap-4">
              @for (ev of upcomingEvents(); track ev.id) {
                <app-event-card [event]="ev"></app-event-card>
              }
            </div>
          }
        </div>
      </section>

      <!-- ===================== POPULAR EVENTS ===================== -->
      @if (popularEvents().length > 0) {
        <section class="section-pad" style="background:#F8FAFC; border-top:1px solid var(--border-subtle); border-bottom:1px solid var(--border-subtle);">
          <div class="container">
            <div class="section-header">
              <div>
                <div class="section-label mb-2" style="color:var(--warning)">
                  <i class="fa-solid fa-fire me-1"></i> Popular
                </div>
                <h2 class="section-title">Top Rated Events</h2>
                <p class="section-subtitle">High-demand events with limited seats — book early.</p>
              </div>
              <a routerLink="/events" class="btn btn-secondary btn-sm">
                Browse All <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
            <div class="grid grid-cols-3 gap-4">
              @for (ev of popularEvents(); track ev.id) {
                <app-event-card [event]="ev"></app-event-card>
              }
            </div>
          </div>
        </section>
      }

      <!-- ===================== HOW IT WORKS ===================== -->
      <section class="section-pad">
        <div class="container">
          <div class="text-center mb-5">
            <div class="section-label mb-2">Seamless Process</div>
            <h2 class="section-title">How EventPark Works</h2>
            <p class="section-subtitle" style="max-width:560px;margin:0 auto">
              A unified flow that connects your event ticket with vehicle parking — 3 simple steps.
            </p>
          </div>

          <div class="how-grid">
            <div class="how-card">
              <div class="how-step-num">01</div>
              <div class="how-icon"><i class="fa-regular fa-compass"></i></div>
              <h4>Choose an Event</h4>
              <p>Browse our live catalogue of music, sports, cultural, and tech events at top venues.</p>
            </div>
            <div class="how-arrow d-none d-md-flex"><i class="fa-solid fa-arrow-right"></i></div>
            <div class="how-card">
              <div class="how-step-num">02</div>
              <div class="how-icon"><i class="fa-solid fa-couch"></i></div>
              <h4>Pick Seats & Parking</h4>
              <p>Select your exact seat on the venue map and claim an allocated parking bay.</p>
            </div>
            <div class="how-arrow d-none d-md-flex"><i class="fa-solid fa-arrow-right"></i></div>
            <div class="how-card">
              <div class="how-step-num">03</div>
              <div class="how-icon"><i class="fa-solid fa-qrcode"></i></div>
              <h4>Get Your Digital Pass</h4>
              <p>Confirm your booking and get an instant QR ticket and parking pass on your device.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================== CTA BANNER ===================== -->
      <section class="section-pad" style="background:var(--bg-main)">
        <div class="container">
          <div class="cta-banner">
            <div class="cta-content">
              <div class="section-label mb-3" style="color:var(--primary)">Join EventPark</div>
              <h2 class="cta-title">Ready for your next event?</h2>
              <p class="cta-sub">
                Create your free EventPark account and book event seats with guaranteed parking in seconds.
              </p>
              <div class="cta-actions">
                <a routerLink="/register" class="btn btn-primary btn-lg">
                  <i class="fa-solid fa-user-plus"></i> Create Free Account
                </a>
                <a routerLink="/events" class="btn btn-outline btn-lg">
                  <i class="fa-regular fa-compass"></i> Browse Events
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .landing-wrapper { overflow-x: hidden; }

    /* Hero */
    .hero-section {
      padding: 5rem 0 4rem;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-subtle);
    }
    .hero-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4rem;
    }
    .hero-content { max-width: 580px; }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.4rem 1rem;
      background: var(--primary-light);
      border: 1px solid var(--primary-subtle);
      border-radius: 99px;
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--primary);
    }
    .badge-pulse {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      flex-shrink: 0;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.15;
      letter-spacing: -1px;
    }
    @media (max-width: 768px) { .hero-title { font-size: 2.25rem; } }

    .highlight {
      color: var(--primary);
      position: relative;
    }

    .hero-desc {
      font-size: 1.05rem;
      color: var(--text-muted);
      line-height: 1.7;
      max-width: 500px;
    }

    .hero-actions { display: flex; gap: 0.875rem; flex-wrap: wrap; }

    .trust-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.825rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .trust-sep { color: var(--border-medium); }

    /* Hero Visual Cards */
    .hero-visual {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      width: 320px;
      flex-shrink: 0;
    }
    .visual-card {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1rem 1.125rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .visual-card:hover { transform: translateX(4px); border-color: var(--primary-subtle); }
    .vc-icon {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .vc-body { display: flex; flex-direction: column; gap: 0.1rem; }
    .vc-tag { font-size: 0.65rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; }
    .vc-body strong { font-size: 0.9rem; color: var(--text-main); }
    .vc-body small { font-size: 0.775rem; color: var(--text-muted); }

    /* Section common */
    .section-pad { padding: 4rem 0; }
    .section-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--primary);
    }
    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .section-title { font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }
    .section-subtitle { font-size: 0.9rem; color: var(--text-muted); margin-top: 0.35rem; line-height: 1.6; }

    /* How it works */
    .how-grid {
      display: flex;
      align-items: center;
      gap: 0;
    }
    .how-card {
      flex: 1;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 2rem 1.5rem;
      position: relative;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .how-card:hover { box-shadow: var(--shadow-md); border-color: var(--primary-subtle); }
    .how-step-num {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary-subtle);
      font-family: var(--font-heading);
      line-height: 1;
      margin-bottom: 0.75rem;
    }
    .how-icon {
      font-size: 1.75rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    .how-card h4 { font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; }
    .how-card p { font-size: 0.875rem; color: var(--text-muted); line-height: 1.6; }
    .how-arrow {
      width: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--border-medium);
      font-size: 1.25rem;
    }
    @media (max-width: 768px) {
      .how-grid { flex-direction: column; gap: 1rem; }
      .how-arrow { display: none !important; }
    }

    /* CTA */
    .cta-banner {
      background: linear-gradient(135deg, #F0FDFA 0%, #E6FFFA 100%);
      border: 1px solid var(--primary-subtle);
      border-radius: var(--radius-xl);
      padding: 3.5rem 3rem;
      text-align: center;
    }
    .cta-title { font-size: 2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.75rem; letter-spacing: -0.5px; }
    .cta-sub { font-size: 0.95rem; color: var(--text-muted); max-width: 540px; margin: 0 auto 2rem; line-height: 1.65; }
    .cta-actions { display: flex; gap: 0.875rem; justify-content: center; flex-wrap: wrap; }
  `]
})
export class LandingComponent implements OnInit {
  authService = inject(AuthService);
  private eventService = inject(EventService);

  upcomingEvents = signal<EventDto[]>([]);
  popularEvents = signal<EventDto[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.upcomingEvents.set(events.slice(0, 3));
        this.popularEvents.set(events.slice(3, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
