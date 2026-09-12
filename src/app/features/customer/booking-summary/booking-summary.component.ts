import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingProgressComponent } from '../../../shared/components/booking-progress/booking-progress.component';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-booking-summary, app-make-reservation',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BookingProgressComponent
  ],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <!-- Progress Step Indicator -->
        <app-booking-progress currentStep="summary"></app-booking-progress>

        <div class="text-center mb-4">
          <h1 class="page-title mb-1 text-main">Booking Summary</h1>
          <p class="text-muted">Review your reservation details before proceeding to payment</p>
        </div>

        <div class="summary-checkout-grid">
          <!-- LEFT: Main Reservation Breakdown -->
          <div class="summary-main-col">
            <!-- 1. EVENT CARD -->
            <div class="card p-4 mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="summary-section-tag">
                  <i class="fa-regular fa-calendar me-1"></i> EVENT
                </span>
                <a [routerLink]="['/events', event()?.id]" class="btn btn-sm btn-secondary">
                  Change Event
                </a>
              </div>

              <div class="event-hero-box p-3 rounded bg-surface-alt border border-subtle d-flex gap-3 align-items-center">
                <img
                  [src]="event()?.imageUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600'"
                  alt="Event"
                  class="event-summary-thumb" />
                <div>
                  <span class="badge badge-primary mb-1">{{ event()?.categoryName || 'Event' }}</span>
                  <h3 class="text-main mb-1">{{ event()?.title }}</h3>
                  <div class="text-primary small mb-1">
                    <i class="fa-regular fa-calendar-check me-1"></i>
                    {{ event()?.eventDate | date:'fullDate' }} &#64; {{ event()?.startTime || event()?.time || (event()?.eventDate | date:'shortTime') }}
                  </div>
                  <div class="text-muted small">
                    <i class="fa-solid fa-location-dot text-primary me-1"></i>
                    {{ event()?.venueName }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. SEATS CARD -->
            <div class="card p-4 mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="summary-section-tag">
                  <i class="fa-solid fa-couch me-1"></i> SEATS
                </span>
                <a [routerLink]="['/booking/seats', event()?.id]" class="btn btn-sm btn-secondary">
                  Modify Seats
                </a>
              </div>

              <div class="p-3 bg-surface-alt border border-subtle rounded">
                <div class="d-flex flex-wrap gap-2 mb-2">
                  @for (seat of bookingState.selectedSeats(); track seat.id) {
                    <span class="badge badge-primary fs-6 py-2 px-3">
                      Row {{ seat.row }} - Seat {{ seat.seatNumber }} (LKR {{ seat.price | number }})
                    </span>
                  }
                </div>
                <div class="d-flex justify-content-between text-muted small border-top border-subtle pt-2 mt-2">
                  <span>Total Tickets: <strong>{{ bookingState.seatsCount() }}</strong></span>
                  <span class="text-main font-bold">LKR {{ bookingState.seatsTotal() | number }}</span>
                </div>
              </div>
            </div>

            <!-- 3. PARKING CARD -->
            <div class="card p-4 mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="summary-section-tag">
                  <i class="fa-solid fa-square-parking me-1"></i> PARKING
                </span>
                <a [routerLink]="['/booking/parking', event()?.id]" class="btn btn-sm btn-secondary">
                  {{ bookingState.selectedParking() ? 'Change Bay' : 'Add Parking' }}
                </a>
              </div>

              @if (bookingState.selectedParking()) {
                <div class="p-3 bg-surface-alt border border-subtle rounded d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center gap-3">
                    <div class="parking-badge-icon">
                      <i class="fa-solid fa-car-side"></i>
                    </div>
                    <div>
                      <strong class="text-main d-block">
                        Bay P{{ bookingState.selectedParking()!.slotNumber < 10 ? '0' + bookingState.selectedParking()!.slotNumber : bookingState.selectedParking()!.slotNumber }}
                      </strong>
                      <small class="text-muted">{{ bookingState.selectedParking()!.zone }}</small>
                    </div>
                  </div>
                  <strong class="text-primary">LKR {{ bookingState.parkingFee() | number }}</strong>
                </div>
              } @else {
                <div class="p-3 bg-surface-alt border border-subtle rounded text-muted small d-flex justify-content-between align-items-center">
                  <span>No parking selected</span>
                  <a [routerLink]="['/booking/parking', event()?.id]" class="text-primary font-bold">
                    + Add venue parking
                  </a>
                </div>
              }
            </div>
          </div>

          <!-- RIGHT: Sticky Order Summary & Confirm -->
          <div class="summary-sidebar-col">
            <div class="card p-4 sticky-sidebar">
              <h3 class="mb-3 text-main">PRICE BREAKDOWN</h3>

              <div class="d-flex flex-column gap-3 mb-4 pb-3 border-bottom border-subtle">
                <div class="d-flex justify-content-between text-muted">
                  <span>Tickets ({{ bookingState.seatsCount() }})</span>
                  <strong class="text-main">LKR {{ bookingState.seatsTotal() | number }}</strong>
                </div>

                <div class="d-flex justify-content-between text-muted">
                  <span>Parking</span>
                  <strong class="text-main">
                    @if (bookingState.selectedParking()) {
                      LKR {{ bookingState.parkingFee() | number }}
                    } @else {
                      LKR 0
                    }
                  </strong>
                </div>

                <div class="d-flex justify-content-between text-muted">
                  <span>Service Fee</span>
                  <span class="badge badge-success">FREE</span>
                </div>
              </div>

              <!-- Grand Total -->
              <div class="d-flex justify-content-between align-items-center mb-4">
                <span class="text-main font-bold fs-5">Total</span>
                <span class="total-price-text text-primary">LKR {{ bookingState.grandTotal() | number }}</span>
              </div>

              <!-- [ Confirm Booking ] Button -->
              <button
                type="button"
                class="btn btn-primary btn-lg w-100 mb-3"
                [disabled]="submitting() || bookingState.seatsCount() === 0"
                (click)="confirmBooking()">
                @if (submitting()) {
                  <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Creating Booking...
                } @else {
                  Confirm Booking <i class="fa-solid fa-arrow-right ms-1"></i>
                }
              </button>

              <div class="d-flex align-items-center justify-content-center gap-2 text-muted small">
                <i class="fa-solid fa-shield-halved text-primary"></i>
                <span>Guaranteed 15-minute checkout hold</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); }
    .summary-checkout-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 992px) {
      .summary-checkout-grid { grid-template-columns: 1fr; }
    }
    .summary-section-tag {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--primary);
    }
    .event-summary-thumb {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .parking-badge-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: var(--primary-subtle);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .sticky-sidebar {
      position: sticky;
      top: 90px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }
    .total-price-text {
      font-family: var(--font-heading);
      font-size: 1.8rem;
      font-weight: 800;
    }
  `]
})
export class BookingSummaryComponent implements OnInit {
  bookingState = inject(BookingStateService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  submitting = signal<boolean>(false);

  event = this.bookingState.currentEvent;

  ngOnInit(): void {
    if (!this.bookingState.hasSelection()) {
      this.toastService.warning('Please select seats before viewing booking summary.');
      this.router.navigate(['/events']);
    }
  }

  confirmBooking(): void {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please sign in or register to complete your reservation.', 'Sign In Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/booking/summary' } });
      return;
    }

    this.submitting.set(true);

    const seatIds = this.bookingState.selectedSeats().map(s => s.id);
    const parkingSlotId = this.bookingState.selectedParking()?.id || null;
    const eventId = this.bookingState.currentEvent()?.id;

    this.bookingService.createBooking({ seatIds, parkingSlotId, eventId }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.bookingState.setActiveHold({
          bookingId: res.bookingId,
          bookingNumber: res.bookingNumber,
          holdExpiresAt: res.holdExpiresAt
        });
        this.toastService.success(`Booking created! Ref: ${res.bookingNumber}`);
        // Navigate to /payment/:bookingId
        this.router.navigate(['/payment', res.bookingId]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastService.error(err.error?.message || 'Failed to create booking. Seats or parking may no longer be available.');
      }
    });
  }
}

export const MakeReservationComponent = BookingSummaryComponent;
export type MakeReservationComponent = BookingSummaryComponent;
