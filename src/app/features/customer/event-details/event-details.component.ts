import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { EventDto } from '../../../core/models/event.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, ErrorBannerComponent],
  template: `
    <div class="page-wrapper">
      <div class="container py-4">
        <!-- Back link -->
        <div class="mb-4">
          <a routerLink="/events" class="back-link d-inline-flex align-items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to all events
          </a>
        </div>

        @if (loading()) {
          <app-loading message="Loading event details..."></app-loading>
        } @else if (error()) {
          <app-error-banner [message]="error()!" (retry)="loadEventDetails()"></app-error-banner>
        } @else if (event()) {
          <div class="event-details-grid">
            <!-- Left: Main Details & Description -->
            <div class="event-main-col">
              <div class="card p-0 overflow-hidden mb-4">
                <div class="event-banner-wrapper position-relative">
                  <img
                    [src]="getImageUrl()"
                    [alt]="event()!.title"
                    class="event-banner-img"
                    (error)="onImageError($event)" />
                  <div class="banner-overlay">
                    <div class="d-flex gap-2 mb-2 flex-wrap">
                      <span class="badge badge-primary">{{ event()!.categoryName || 'Featured Event' }}</span>
                      <span class="badge badge-gold">{{ event()!.status || 'Open for Booking' }}</span>
                    </div>
                    <h1 class="event-hero-title mb-0 text-white">{{ event()!.title }}</h1>
                  </div>
                </div>

                <div class="p-4 p-md-5">
                  <div class="row d-flex flex-wrap gap-4 mb-4 pb-4 border-bottom border-subtle">
                    <!-- Date -->
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-bubble">
                        <i class="fa-regular fa-calendar-days"></i>
                      </div>
                      <div>
                        <small class="text-dim d-block text-uppercase letter-spacing-1">Event Date</small>
                        <strong class="text-main">{{ event()!.eventDate | date:'fullDate' }}</strong>
                      </div>
                    </div>

                    <!-- Time -->
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-bubble">
                        <i class="fa-regular fa-clock"></i>
                      </div>
                      <div>
                        <small class="text-dim d-block text-uppercase letter-spacing-1">Time Schedule</small>
                        <strong class="text-main">
                          {{ event()!.eventDate | date:'shortTime' }}
                          @if (event()!.endTime) {
                            — {{ event()!.endTime | date:'shortTime' }}
                          }
                        </strong>
                      </div>
                    </div>

                    <!-- Venue -->
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-bubble">
                        <i class="fa-solid fa-location-dot"></i>
                      </div>
                      <div>
                        <small class="text-dim d-block text-uppercase letter-spacing-1">Venue Location</small>
                        <strong class="text-main">{{ event()!.venueName || 'Main Arena Hall' }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <h3 class="mb-3 section-heading">About This Experience</h3>
                  <div class="event-body-text mb-4">
                    <p class="text-muted leading-relaxed">
                      {{ event()!.description || 'Join us for this exciting live event at ' + (event()!.venueName || 'our venue') + '. Secure your seats now with visual interactive seat mapping and synchronized venue parking bays.' }}
                    </p>
                  </div>

                  <!-- Venue Visual Highlight -->
                  <div class="venue-info-box card p-3 mb-4 d-flex flex-row align-items-center gap-3">
                    <img [src]="getVenuePhoto()" alt="Venue" class="venue-thumb-img" />
                    <div>
                      <small class="text-dim text-uppercase letter-spacing-1">Hosting Venue</small>
                      <h4 class="mb-1 text-main">{{ event()!.venueName || 'Grand Arena Stadium' }}</h4>
                      <p class="text-muted small mb-0"><i class="fa-solid fa-car me-1 text-accent"></i> Dedicated parking slots available for reservation</p>
                    </div>
                  </div>

                  <!-- Booking Step Guidance -->
                  <div class="card p-4 how-it-works-box">
                    <h4 class="mb-3 d-flex align-items-center gap-2 text-main">
                      <i class="fa-solid fa-circle-check text-primary"></i>
                      How Unified Booking Works
                    </h4>
                    <div class="d-flex flex-column gap-2 text-muted">
                      <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid fa-check text-primary"></i>
                        <span>Step 1: Choose your exact seats on the real-time interactive stage grid</span>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid fa-check text-primary"></i>
                        <span>Step 2: Optionally bundle an allocated venue parking bay right near your gate</span>
                      </div>
                      <div class="d-flex align-items-center gap-2">
                        <i class="fa-solid fa-check text-primary"></i>
                        <span>Step 3: Enjoy a 15-minute guaranteed concurrency hold during checkout</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Action Sidebar -->
            <div class="event-sidebar-col">
              <div class="card p-4 sticky-sidebar">
                <span class="badge badge-gold mb-2">Available for Booking</span>
                <h3 class="sidebar-title mb-3">Reserve Your Tickets</h3>

                <div class="sidebar-stat-box p-3 mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-dim">Venue Capacity</span>
                    <strong class="text-main">{{ event()!.capacity }} seats</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span class="text-dim">Status</span>
                    <span class="badge badge-primary">{{ event()!.status || 'Active' }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-dim">Parking Bays</span>
                    <span class="text-primary font-bold"><i class="fa-solid fa-car"></i> Synchronized</span>
                  </div>
                </div>

                <div class="d-flex flex-column gap-2 mb-4">
                  <button class="btn btn-primary btn-lg w-100" (click)="proceedToSeats()">
                    <i class="fa-solid fa-couch me-1"></i> Select Seats <i class="fa-solid fa-arrow-right ms-auto"></i>
                  </button>

                  <a [routerLink]="['/events', event()!.id, 'parking']" class="btn btn-secondary w-100">
                    <i class="fa-solid fa-square-parking me-1"></i> Preview Parking Layout
                  </a>
                </div>

                <div class="security-features text-dim">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="fa-solid fa-shield-halved text-primary"></i>
                    <small>Real-time concurrency & seat lock</small>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-bolt text-accent"></i>
                    <small>Instant receipt & digital pass</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 500;
      transition: color var(--transition-fast);
      text-decoration: none;
    }
    .back-link:hover {
      color: var(--primary);
    }
    .event-details-grid {
      display: grid;
      grid-template-columns: 2.2fr 1fr;
      gap: 2rem;
      font-family: var(--font-body);
    }
    @media (max-width: 992px) {
      .event-details-grid { grid-template-columns: 1fr; }
    }
    .event-banner-wrapper {
      height: 380px;
      overflow: hidden;
      position: relative;
      background: var(--bg-surface);
    }
    .event-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .banner-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 3rem 2rem 1.75rem;
      background: linear-gradient(to top, rgba(20, 28, 22, 0.95) 0%, rgba(20, 28, 22, 0.5) 60%, transparent 100%);
    }
    .event-hero-title {
      font-family: var(--font-heading);
      font-size: 2.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .icon-bubble {
      width: 46px;
      height: 46px;
      border-radius: var(--radius-md);
      background: var(--primary-subtle);
      border: 1px solid var(--border-medium);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .section-heading {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .event-body-text p {
      font-size: 1.025rem;
      line-height: 1.75;
      color: var(--text-muted);
    }
    .venue-info-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
    .venue-thumb-img {
      width: 80px;
      height: 60px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .how-it-works-box {
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
    }
    .sticky-sidebar {
      position: sticky;
      top: 90px;
      border: 1px solid var(--border-medium);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }
    .sidebar-title {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .sidebar-stat-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }
  `]
})
export class EventDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private bookingState = inject(BookingStateService);

  event = signal<EventDto | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  defaultImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80';

  ngOnInit(): void {
    this.loadEventDetails();
  }

  loadEventDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Event ID is missing.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.eventService.getEventById(parseInt(id, 10)).subscribe({
      next: (data) => {
        this.event.set(data);
        this.loading.set(false);
        this.bookingState.setEvent(data);
      },
      error: () => {
        const fallback: EventDto = {
          id: parseInt(id, 10) || 1,
          title: 'Neon Symphony: Live World Arena Tour',
          description: 'An electrifying sensory live music experience featuring synchronized lasers, orchestral arrangements, and special guest international artists. Reserve your exact auditorium seats and optional venue parking space now.',
          eventDate: new Date(Date.now() + 86400000 * 4).toISOString(),
          venueId: 1,
          venueName: 'Grand National Arena',
          categoryId: 1,
          categoryName: 'Live Concert',
          capacity: 15000,
          imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
          status: 'Booking Open'
        };
        this.event.set(fallback);
        this.bookingState.setEvent(fallback);
        this.loading.set(false);
      }
    });
  }

  proceedToSeats(): void {
    if (this.event()) {
      this.bookingState.setEvent(this.event()!);
      this.router.navigate(['/events', this.event()!.id, 'seats']);
    }
  }

  getImageUrl(): string {
    const ev = this.event();
    if (!ev) return this.defaultImage;
    if (ev.imageUrl && ev.imageUrl.trim().length > 5) return ev.imageUrl;

    const category = (ev.categoryName || '').toLowerCase();
    if (category.includes('music') || category.includes('concert')) {
      return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80';
    }
    if (category.includes('sport') || category.includes('match')) {
      return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80';
    }
    if (category.includes('theatre') || category.includes('art')) {
      return 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200&auto=format&fit=crop&q=80';
    }
    if (category.includes('tech') || category.includes('conference')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80';
    }
    return this.defaultImage;
  }

  getVenuePhoto(): string {
    return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80';
  }

  onImageError(e: any): void {
    e.target.src = this.defaultImage;
  }
}
