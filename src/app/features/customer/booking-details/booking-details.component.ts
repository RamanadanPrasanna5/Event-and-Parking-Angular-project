import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { CustomerBookingDto } from '../../../core/models/booking.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DigitalReceiptComponent } from '../../../shared/components/digital-receipt/digital-receipt.component';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, DigitalReceiptComponent],
  template: `
    <div class="page-wrapper">
      <div class="container container-sm">
        <!-- Back Link -->
        <div class="mb-4">
          <a routerLink="/my-bookings" class="back-link d-inline-flex align-items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to My Bookings
          </a>
        </div>

        @if (loading()) {
          <app-loading message="Loading booking details..."></app-loading>
        } @else if (booking()) {
          <div class="card p-4 p-md-5 mb-4">
            <!-- Header with Booking Number & Badges -->
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-subtle gap-2">
              <div>
                <span class="text-dim text-xs text-uppercase d-block mb-1">Booking Number</span>
                <strong class="font-mono fs-3 text-primary">{{ booking()!.bookingNumber }}</strong>
              </div>
              <div class="d-flex gap-2">
                <span class="badge" [class.badge-success]="booking()!.status === 'Confirmed'" [class.badge-danger]="booking()!.status === 'Cancelled'">
                  Status: {{ booking()!.status }}
                </span>
                <span class="badge badge-primary">
                  Payment: {{ booking()!.paymentStatus || 'Paid' }}
                </span>
              </div>
            </div>

            <!-- Event Details -->
            <div class="mb-4">
              <span class="text-muted text-xs text-uppercase d-block mb-1">Event</span>
              <h2 class="text-main mb-2">{{ booking()!.eventName }}</h2>

              <div class="row d-flex flex-wrap gap-3 p-3 bg-surface-alt border border-subtle rounded">
                <div class="flex-grow-1">
                  <small class="text-muted text-uppercase d-block">Date</small>
                  <strong class="text-main">{{ booking()!.eventDate | date:'fullDate' }}</strong>
                </div>

                <div class="flex-grow-1">
                  <small class="text-muted text-uppercase d-block">Time</small>
                  <strong class="text-main">{{ booking()!.eventTime || '07:30 PM' }}</strong>
                </div>

                <div class="flex-grow-1">
                  <small class="text-muted text-uppercase d-block">Venue</small>
                  <strong class="text-main">{{ booking()!.venue || 'Grand National Arena' }}</strong>
                </div>
              </div>
            </div>

            <!-- Seats & Parking Allocations -->
            <div class="row d-flex flex-wrap gap-3 mb-4">
              <div class="flex-grow-1 p-3 bg-surface-alt border border-subtle rounded">
                <small class="text-muted text-uppercase d-block mb-2">
                  <i class="fa-solid fa-couch text-primary me-1"></i> Reserved Seats
                </small>
                <div class="d-flex flex-wrap gap-1">
                  @for (seat of booking()!.seatNumbers; track seat) {
                    <span class="badge badge-primary py-1 px-2 fs-6">{{ seat }}</span>
                  }
                </div>
              </div>

              <div class="flex-grow-1 p-3 bg-surface-alt border border-subtle rounded">
                <small class="text-muted text-uppercase d-block mb-2">
                  <i class="fa-solid fa-square-parking text-primary me-1"></i> Vehicle Parking
                </small>
                <strong class="text-main d-block">
                  {{ booking()!.parkingDetails || 'No parking reserved' }}
                </strong>
              </div>
            </div>

            <!-- Total Amount Paid -->
            <div class="d-flex justify-content-between align-items-center pt-3 border-top border-subtle mb-4">
              <span class="text-main font-bold fs-5">Total Amount</span>
              <strong class="text-primary fs-3 font-heading font-bold">
                LKR {{ (booking()?.totalPrice || 0) | number }}
              </strong>
            </div>

            <!-- Action Buttons: View Receipt, Pay Now, Cancel, Back -->
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-2">
              <a routerLink="/my-bookings" class="btn btn-secondary">
                <i class="fa-solid fa-arrow-left me-1"></i> Back to My Bookings
              </a>

              <div class="d-flex flex-wrap gap-2">
                @if (booking()!.paymentStatus !== 'Paid' && booking()!.status !== 'Cancelled') {
                  <a [routerLink]="['/payment', booking()!.id]" class="btn btn-primary">
                    <i class="fa-solid fa-credit-card me-1"></i> Pay Now
                  </a>
                }

                @if (booking()!.status === 'Confirmed' || booking()!.paymentStatus === 'Paid') {
                  <button type="button" class="btn btn-secondary" (click)="showReceipt = true">
                    <i class="fa-solid fa-receipt me-1"></i> View Receipt
                  </button>
                }

                @if (booking()!.status !== 'Cancelled') {
                  <button
                    type="button"
                    class="btn btn-danger"
                    [disabled]="cancelling()"
                    (click)="showCancelModal = true">
                    @if (cancelling()) {
                      <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Cancelling...
                    } @else {
                      <i class="fa-solid fa-ban me-1"></i> Cancel Booking
                    }
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Digital Receipt Modal -->
    <app-digital-receipt
      [isOpen]="showReceipt"
      [booking]="booking()"
      (closeReceipt)="showReceipt = false">
    </app-digital-receipt>

    <!-- Cancel Confirmation Modal -->
    @if (showCancelModal && booking()) {
      <div class="modal-overlay" (click)="showCancelModal = false">
        <div class="card p-4 modal-box" (click)="$event.stopPropagation()">
          <div class="d-flex align-items-center gap-3 mb-3 text-danger">
            <i class="fa-solid fa-triangle-exclamation fs-3"></i>
            <h3 class="mb-0 text-main">Cancel Booking</h3>
          </div>
          <p class="text-muted mb-4">
            Are you sure you want to cancel booking <strong class="text-main font-mono">{{ booking()!.bookingNumber }}</strong>? All reserved seats and parking will be released back to the event pool.
          </p>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" (click)="showCancelModal = false" [disabled]="cancelling()">
              Back
            </button>
            <button
              type="button"
              class="btn btn-danger"
              [disabled]="cancelling()"
              (click)="executeCancel()">
              @if (cancelling()) {
                <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Cancelling...
              } @else {
                <i class="fa-solid fa-ban me-1"></i> Confirm Cancellation
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); }
    .back-link { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; text-decoration: none; }
    .back-link:hover { color: var(--primary); }
    .font-mono { font-family: monospace; }
    .text-xs { font-size: 0.725rem; }
    .modal-box {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
    }
  `]
})
export class BookingDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  booking = signal<CustomerBookingDto | null>(null);
  loading = signal<boolean>(true);
  cancelling = signal<boolean>(false);
  showReceipt = false;
  showCancelModal = false;

  ngOnInit(): void {
    this.loadBooking();
  }

  loadBooking(): void {
    const idParam = this.route.snapshot.paramMap.get('bookingId') || this.route.snapshot.paramMap.get('id');
    const id = idParam ? idParam : 1;

    this.bookingService.getBookingById(id).subscribe({
      next: b => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  executeCancel(): void {
    const current = this.booking();
    if (!current) return;
    this.cancelling.set(true);

    this.bookingService.cancelBooking(current.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.showCancelModal = false;
        this.loadBooking();
      },
      error: () => {
        this.cancelling.set(false);
      }
    });
  }
}
