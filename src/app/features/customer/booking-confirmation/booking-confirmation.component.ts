import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-confirmation, app-reservation-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="container container-sm py-5">
        <div class="text-center mb-4 no-print">
          <div class="success-icon-bubble mx-auto mb-3">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <span class="badge badge-gold mb-2">Transaction Approved</span>
          <h1 class="page-title mb-2">Reservation Confirmed!</h1>
          <p class="text-muted">Thank you for booking with Event Park. Your seats and parking bay are secured.</p>
        </div>

        <!-- PRINTABLE RECEIPT CARD -->
        <div class="card p-4 p-md-5 receipt-card mb-4" id="receipt">
          <div class="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom border-subtle">
            <div>
              <div class="brand-text font-bold mb-1" style="font-size: 1.45rem; font-family: var(--font-heading);">
                EVENT<span style="color: var(--primary);">PARK</span>
              </div>
              <small class="text-dim">Official Booking & Payment Receipt</small>
            </div>
            <div class="text-end">
              <span class="badge badge-gold mb-1">STATUS: CONFIRMED</span>
              <small class="text-dim d-block">{{ currentDate | date:'medium' }}</small>
            </div>
          </div>

          <div class="row d-flex flex-wrap gap-3 mb-4">
            <div class="flex-grow-1">
              <small class="text-dim text-uppercase letter-spacing-1 d-block mb-1">Booking Reference</small>
              <strong class="receipt-highlight font-mono">{{ bookingNumber }}</strong>
            </div>

            <div class="flex-grow-1">
              <small class="text-dim text-uppercase letter-spacing-1 d-block mb-1">Receipt Number</small>
              <strong class="receipt-highlight font-mono">{{ receiptNumber }}</strong>
            </div>
          </div>

          <div class="receipt-section p-3 mb-4">
            <small class="text-dim text-uppercase letter-spacing-1 d-block mb-1">Event Name</small>
            <h4 class="mb-0 text-main font-heading">{{ eventTitle }}</h4>
          </div>

          <div class="d-flex justify-content-between align-items-center py-3 border-top border-bottom border-subtle mb-4">
            <span class="font-bold text-main fs-5">Total Amount Paid</span>
            <strong class="paid-amount text-primary" style="font-size: 1.6rem; font-family: var(--font-heading);">
              LKR {{ totalPaid | number }}
            </strong>
          </div>

          <div class="text-center text-dim" style="font-size: 0.85rem;">
            <p class="mb-1">Present your booking reference at the venue entrance and parking gate.</p>
            <p class="mb-0">A confirmation notification has been added to your Event Park account.</p>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="d-flex flex-wrap justify-content-center gap-3 no-print">
          <button class="btn btn-secondary" (click)="printReceipt()">
            <i class="fa-solid fa-print me-1"></i> Print Receipt
          </button>
          <a routerLink="/customer/my-bookings" class="btn btn-primary">
            <i class="fa-solid fa-ticket me-1"></i> View My Reservations
          </a>
          <a routerLink="/events" class="btn btn-secondary">
            Browse More Events
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-family: var(--font-heading);
      font-size: 2.35rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .success-icon-bubble {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: var(--primary-subtle);
      border: 2px solid var(--primary);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.6rem;
      box-shadow: var(--shadow-primary);
    }
    .receipt-card {
      border: 1px solid var(--border-medium);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      font-family: var(--font-body);
    }
    .receipt-section {
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .receipt-highlight {
      font-size: 1.2rem;
      color: var(--primary);
      font-weight: 700;
    }
  `]
})
export class BookingConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);

  bookingNumber: string = 'BK-PENDING';
  receiptNumber: string = 'RCP-PENDING';
  eventTitle: string = 'Event Booking';
  totalPaid: number = 0;
  currentDate = new Date();

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.bookingNumber = params['bookingNumber'] || 'BK-SUCCESS';
      this.receiptNumber = params['receiptNumber'] || 'RCP-SUCCESS';
      this.eventTitle = params['eventTitle'] || 'Confirmed Event Booking';
      this.totalPaid = params['total'] ? parseFloat(params['total']) : 0;
    });
  }

  printReceipt(): void {
    window.print();
  }
}

export const ReservationSuccessComponent = BookingConfirmationComponent;
export type ReservationSuccessComponent = BookingConfirmationComponent;
