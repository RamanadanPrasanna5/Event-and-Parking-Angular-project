import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { EventDto } from '../../../core/models/event.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <!-- Back link -->
        <div class="mb-4">
          <a routerLink="/events" class="back-link d-inline-flex align-items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to Events
          </a>
        </div>

        @if (loading()) {
          <app-loading message="Loading event details..."></app-loading>
        } @else if (event()) {
          <div class="event-details-grid">
            <!-- Left: Large Image & Event Information -->
            <div class="event-main-col">
              <div class="card p-0 overflow-hidden mb-4">
                <!-- Large Event Image -->
                <div class="event-banner-wrapper position-relative">
                  <img
                    [src]="getImageUrl()"
                    [alt]="event()!.title"
                    class="event-banner-img"
                    (error)="onImageError($event)" />
                  <div class="banner-overlay">
                    <div class="d-flex gap-2 mb-2 flex-wrap">
                      <span class="badge badge-primary">{{ event()!.categoryName || 'Live Event' }}</span>
                      <span class="badge badge-success">{{ event()!.status || 'Booking Open' }}</span>
                    </div>
                    <h1 class="event-hero-title mb-0 text-white">{{ event()!.title }}</h1>
                  </div>
                </div>

                <div class="p-4 p-md-5">
                  <!-- Date, Time, Venue Pills -->
                  <div class="row d-flex flex-wrap gap-4 mb-4 pb-4 border-bottom border-subtle">
                    <!-- Date -->
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-bubble">
                        <i class="fa-regular fa-calendar-days"></i>
                      </div>
                      <div>
                        <small class="text-muted d-block text-uppercase">Date</small>
                        <strong class="text-main">{{ event()!.eventDate | date:'fullDate' }}</strong>
                      </div>
                    </div>

                    <!-- Time -->
                    <div class="d-flex align-items-center gap-3">
                      <div class="icon-bubble">
                        <i class="fa-regular fa-clock"></i>
                      </div>
                      <div>
                        <small class="text-muted d-block text-uppercase">Time</small>
                        <strong class="text-main">
                          {{ event()!.startTime || event()!.time || (event()!.eventDate | date:'shortTime') }}
                          @if (event()!.endTime) {
                            — {{ event()!.endTime }}
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
                        <small class="text-muted d-block text-uppercase">Venue</small>
                        <strong class="text-main">{{ event()!.venueName || 'Grand National Arena' }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <h3 class="mb-3 text-main">Event Description</h3>
                  <div class="event-body-text mb-4">
                    <p class="text-muted leading-relaxed">
                      {{ event()!.description || 'Experience this exceptional live event with high fidelity sound, stage production, and dedicated synchronized parking.' }}
                    </p>
                  </div>

                  <!-- Event Information & Facilities -->
                  <h3 class="mb-3 text-main">Event Information</h3>
                  <div class="grid grid-cols-2 gap-3 mb-4">
                    <div class="facility-pill p-3 rounded bg-surface-alt d-flex align-items-center gap-3">
                      <i class="fa-solid fa-couch text-primary fs-5"></i>
                      <div>
                        <strong class="text-main d-block small">Reserved Seating Map</strong>
                        <span class="text-muted small">Pick exact rows & seats</span>
                      </div>
                    </div>

                    <div class="facility-pill p-3 rounded bg-surface-alt d-flex align-items-center gap-3">
                      <i class="fa-solid fa-square-parking text-primary fs-5"></i>
                      <div>
                        <strong class="text-main d-block small">Synchronized Parking</strong>
                        <span class="text-muted small">Dedicated gate bay allocation</span>
                      </div>
                    </div>

                    <div class="facility-pill p-3 rounded bg-surface-alt d-flex align-items-center gap-3">
                      <i class="fa-solid fa-qrcode text-success fs-5"></i>
                      <div>
                        <strong class="text-main d-block small">Digital Pass & Barcode</strong>
                        <span class="text-muted small">Instant entrance scanning</span>
                      </div>
                    </div>

                    <div class="facility-pill p-3 rounded bg-surface-alt d-flex align-items-center gap-3">
                      <i class="fa-solid fa-stopwatch text-info fs-5"></i>
                      <div>
                        <strong class="text-main d-block small">15-Minute Seat Hold</strong>
                        <span class="text-muted small">Zero concurrency conflicts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Action Sidebar -->
            <div class="event-sidebar-col">
              <div class="card p-4 sticky-sidebar">
                <span class="badge badge-success mb-2">Instant Confirmation</span>
                <h3 class="sidebar-title mb-3 text-main">Reserve Tickets</h3>

                <div class="sidebar-stat-box p-3 mb-3 rounded bg-surface-alt border border-subtle">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Venue</span>
                    <strong class="text-main">{{ event()!.venueName }}</strong>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">Category</span>
                    <span class="badge badge-primary">{{ event()!.categoryName || 'General' }}</span>
                  </div>

                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">Auditorium Capacity</span>
                    <strong class="text-primary">{{ (event()?.capacity || 0) | number }} seats</strong>
                  </div>
                </div>

                <div class="d-flex flex-column gap-3 mb-4">
                  <!-- [ Select Seats ] button navigates to /booking/seats/:eventId -->
                  <button class="btn btn-primary btn-lg w-100" (click)="proceedToSeats()">
                    <i class="fa-solid fa-couch me-1"></i> Select Seats <i class="fa-solid fa-arrow-right ms-auto"></i>
                  </button>

                  <!-- [ Back to Events ] button navigates to /events -->
                  <a routerLink="/events" class="btn btn-secondary w-100">
                    <i class="fa-solid fa-arrow-left me-1"></i> Back to Events
                  </a>
                </div>

                <div class="security-features text-muted small">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="fa-solid fa-shield-halved text-primary"></i>
                    <span>Official verified event ticket</span>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <i class="fa-solid fa-file-invoice text-primary"></i>
                    <span>Digital receipt with gate barcode</span>
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
      font-size: 0.95rem;
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
    }
    @media (max-width: 992px) {
      .event-details-grid { grid-template-columns: 1fr; }
    }
    .event-banner-wrapper {
      height: 380px;
      overflow: hidden;
      position: relative;
    }
    .event-banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.85) 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 2rem;
    }
    .event-hero-title {
      font-size: 2.4rem;
      font-weight: 800;
    }
    .icon-bubble {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: var(--primary-subtle);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .facility-pill {
      border: 1px solid var(--border-subtle);
    }
    .sticky-sidebar {
      position: sticky;
      top: 90px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
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

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('id');
    const eventId = idParam ? parseInt(idParam, 10) : 1;

    this.eventService.getEventById(eventId).subscribe({
      next: ev => {
        this.event.set(ev);
        this.bookingState.setEvent(ev);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  proceedToSeats(): void {
    if (this.event()) {
      this.bookingState.setEvent(this.event()!);
      this.router.navigate(['/booking/seats', this.event()!.id]);
    }
  }

  getImageUrl(): string {
    const ev = this.event();
    if (!ev) return '';
    return ev.imageUrl || ev.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200';
  }

  onImageError(e: any): void {
    e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200';
  }
}
