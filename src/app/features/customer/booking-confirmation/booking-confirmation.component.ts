import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { CustomerBookingDto } from '../../../core/models/booking.model';
import { BookingProgressComponent } from '../../../shared/components/booking-progress/booking-progress.component';
import { DigitalReceiptComponent } from '../../../shared/components/digital-receipt/digital-receipt.component';

@Component({
  selector: 'app-booking-confirmation, app-reservation-success',
  standalone: true,
  imports: [CommonModule, RouterLink, BookingProgressComponent, DigitalReceiptComponent],
  template: `
    <div class="page-wrapper">
      <div class="container container-sm">
        <!-- Progress Completed Indicator -->
        <app-booking-progress currentStep="confirmed"></app-booking-progress>

        <!-- Success Tick Icon & Title -->
        <div class="text-center mb-4">
          <div class="success-icon-bubble mx-auto mb-3 animate-success">
            <i class="fa-solid fa-check"></i>
          </div>
          <span class="badge badge-success mb-2">Payment Confirmed</span>
          <h1 class="page-title mb-2 text-main">Booking Confirmed</h1>
          <p class="text-muted">Your tickets and reserved parking space are locked in. We look forward to seeing you!</p>
        </div>

        <!-- Booking Details Card -->
        <div class="card p-4 p-md-5 mb-4 booking-confirmed-card">
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-subtle">
            <div>
              <span class="text-muted text-xs text-uppercase d-block mb-1">Booking Number</span>
              <strong class="font-mono fs-4 text-primary">{{ booking?.bookingNumber || 'BK-' + bookingId }}</strong>
            </div>
            <div class="text-end">
              <span class="badge badge-success mb-1">Status: Confirmed</span>
              <small class="text-muted d-block">{{ currentDate | date:'mediumDate' }}</small>
            </div>
          </div>

          <!-- Event Info -->
          <div class="confirmed-info-row mb-3">
            <small class="text-muted text-uppercase d-block mb-1">Event</small>
            <h3 class="text-main mb-0">{{ booking?.eventName }}</h3>
          </div>

          <!-- Date & Venue -->
          <div class="row d-flex flex-wrap gap-3 mb-3">
            <div class="flex-grow-1">
              <small class="text-muted text-uppercase d-block mb-1">Date</small>
              <strong class="text-main">{{ booking?.eventDate | date:'fullDate' }}</strong>
            </div>

            <div class="flex-grow-1">
              <small class="text-muted text-uppercase d-block mb-1">Venue</small>
              <strong class="text-main">{{ booking?.venue }}</strong>
            </div>
          </div>

          <!-- Seats & Parking -->
          <div class="row d-flex flex-wrap gap-3 mb-4 pb-3 border-bottom border-subtle">
            <div class="flex-grow-1">
              <small class="text-muted text-uppercase d-block mb-1">Seats</small>
              <strong class="text-main">{{ formatSeats(booking?.seatNumbers) }}</strong>
            </div>

            <div class="flex-grow-1">
              <small class="text-muted text-uppercase d-block mb-1">Parking</small>
              <strong class="text-main">{{ booking?.parkingDetails || 'No parking selected' }}</strong>
            </div>
          </div>

          <!-- Total -->
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted font-bold">Total Paid</span>
            <span class="text-primary fs-3 font-heading font-bold">
              LKR {{ (booking?.totalPrice || 0) | number }}
            </span>
          </div>
        </div>

        <!-- ACTION BUTTONS: View Booking, My Bookings, View Receipt -->
        <div class="d-flex flex-wrap justify-content-center gap-3">
          <a [routerLink]="['/my-bookings', booking?.id || bookingId]" class="btn btn-primary btn-lg">
            <i class="fa-regular fa-file-lines me-1"></i> View Booking
          </a>

          <a routerLink="/my-bookings" class="btn btn-secondary btn-lg">
            <i class="fa-solid fa-ticket me-1"></i> My Bookings
          </a>

          <button type="button" class="btn btn-secondary btn-lg" (click)="showReceiptModal = true">
            <i class="fa-solid fa-receipt me-1"></i> View Receipt
          </button>
        </div>
      </div>
    </div>

    <!-- Digital Receipt Modal -->
    <app-digital-receipt
      [isOpen]="showReceiptModal"
      [booking]="booking"
      (closeReceipt)="showReceiptModal = false">
    </app-digital-receipt>
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); }
    .success-icon-bubble {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: #DCFCE7;
      border: 2px solid #10B981;
      color: #10B981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.6rem;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
    }
    .animate-success {
      animation: scaleCheck 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes scaleCheck {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .booking-confirmed-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
    }
    .font-mono { font-family: monospace; }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  bookingId: number = 1;
  booking: CustomerBookingDto | null = null;
  currentDate = new Date();
  showReceiptModal = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('bookingId');
    if (idParam) {
      this.bookingId = parseInt(idParam, 10);
    }

    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: b => {
        this.booking = b;
      },
      error: () => {}
    });
  }

  formatSeats(seats?: string[]): string {
    if (!seats || seats.length === 0) return 'None';
    return seats.join(', ');
  }
}

export const ReservationSuccessComponent = BookingConfirmationComponent;
export type ReservationSuccessComponent = BookingConfirmationComponent;
