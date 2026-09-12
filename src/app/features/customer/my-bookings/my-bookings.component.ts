import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerBookingDto } from '../../../core/models/booking.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DigitalReceiptComponent } from '../../../shared/components/digital-receipt/digital-receipt.component';

@Component({
  selector: 'app-my-bookings, app-my-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingComponent,
    DigitalReceiptComponent
  ],
  template: `
    <div class="page-wrapper py-4">
      <div class="container">
        <!-- Page Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span class="badge badge-primary mb-2">Customer Reservations</span>
            <h1 class="page-title mb-1 text-main">My Bookings</h1>
            <p class="text-muted mb-0">View all your upcoming and past event tickets and vehicle parking reservations</p>
          </div>
          <a routerLink="/events" class="btn btn-primary">
            <i class="fa-solid fa-plus me-1"></i> Book Another Event
          </a>
        </div>

        <!-- UPCOMING BOOKINGS vs PAST BOOKINGS Tabs -->
        <div class="booking-tabs d-flex gap-2 mb-4 pb-2 border-bottom border-subtle">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'upcoming'"
            (click)="activeTab.set('upcoming')">
            <i class="fa-regular fa-calendar-check me-2"></i>
            Upcoming Bookings ({{ upcomingBookings().length }})
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'past'"
            (click)="activeTab.set('past')">
            <i class="fa-solid fa-clock-rotate-left me-2"></i>
            Past Bookings ({{ pastBookings().length }})
          </button>
        </div>

        @if (loading()) {
          <app-loading message="Loading your bookings..."></app-loading>
        } @else if (displayedBookings().length === 0) {
          <div class="card text-center p-5 mb-4">
            <div class="mb-3 text-primary fs-1">
              <i class="fa-solid fa-ticket"></i>
            </div>
            <h3 class="mb-2 text-main">No {{ activeTab() === 'upcoming' ? 'Upcoming' : 'Past' }} Bookings</h3>
            <p class="text-muted mb-4 mx-auto" style="max-width: 460px;">
              {{ activeTab() === 'upcoming'
                ? "You don't have any upcoming reservations scheduled. Discover an event today!"
                : "No past event bookings found in your account history." }}
            </p>
            <a routerLink="/events" class="btn btn-primary mx-auto">
              <i class="fa-regular fa-compass me-1"></i> Explore Events
            </a>
          </div>
        } @else {
          <!-- Responsive Cards Grid for Bookings -->
          <div class="grid grid-cols-2 gap-4">
            @for (booking of displayedBookings(); track booking.id) {
              <div class="card p-0 overflow-hidden booking-item-card d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex flex-column flex-sm-row gap-3 p-4">
                    <!-- Event Image -->
                    <img
                      [src]="booking.eventImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'"
                      [alt]="booking.eventName"
                      class="booking-card-thumb" />

                    <!-- Header & Event Name -->
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge badge-primary font-mono">{{ booking.bookingNumber }}</span>
                        <span class="badge" [class.badge-success]="booking.status === 'Confirmed'" [class.badge-danger]="booking.status === 'Cancelled'" [class.badge-warning]="booking.status === 'Pending'">
                          {{ booking.status }}
                        </span>
                      </div>

                      <h3 class="booking-event-title mb-2 text-main">{{ booking.eventName }}</h3>

                      <div class="text-primary small mb-1">
                        <i class="fa-regular fa-calendar me-1"></i>
                        {{ booking.eventDate | date:'mediumDate' }} &#64; {{ booking.eventTime || '07:30 PM' }}
                      </div>

                      <div class="text-muted small mb-2">
                        <i class="fa-solid fa-location-dot text-primary me-1"></i>
                        {{ booking.venue || 'Venue' }}
                      </div>
                    </div>
                  </div>

                  <!-- Details Row: Seats & Parking & Payment Status -->
                  <div class="px-4 pb-3">
                    <div class="row d-flex flex-wrap gap-2 p-3 rounded bg-surface-alt border border-subtle text-sm">
                      <div class="flex-grow-1">
                        <span class="text-muted d-block text-xs text-uppercase mb-1">Seats</span>
                        <div class="d-flex flex-wrap gap-1">
                          @for (seat of booking.seatNumbers; track seat) {
                            <span class="badge badge-neutral">{{ seat }}</span>
                          }
                          @if (!booking.seatNumbers.length) {
                            <span class="text-muted small">Standard Admission</span>
                          }
                        </div>
                      </div>

                      <div class="flex-grow-1">
                        <span class="text-muted d-block text-xs text-uppercase mb-1">Parking</span>
                        <strong class="text-main">
                          {{ booking.parkingDetails || 'None' }}
                        </strong>
                      </div>

                      <div>
                        <span class="text-muted d-block text-xs text-uppercase mb-1">Payment Status</span>
                        <span class="badge" [class.badge-success]="booking.paymentStatus === 'Paid'" [class.badge-warning]="booking.paymentStatus !== 'Paid'">
                          {{ booking.paymentStatus || 'Pending' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer with Total and Action Buttons -->
                <div class="card-footer-action p-4 border-top border-subtle d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <small class="text-muted d-block text-xs text-uppercase">Total Amount</small>
                    <strong class="text-primary fs-5">LKR {{ booking.totalPrice | number }}</strong>
                  </div>

                  <!-- Action Buttons: Hierarchy Enforced -->
                  <div class="d-flex flex-wrap gap-2">
                    <!-- Pay Now (Primary) - If unpaid and active -->
                    @if (booking.paymentStatus !== 'Paid' && booking.status !== 'Cancelled') {
                      <a [routerLink]="['/payment', booking.id]" class="btn btn-primary btn-sm">
                        <i class="fa-solid fa-credit-card me-1"></i> Pay Now
                      </a>
                    }

                    <!-- Receipt (Secondary) - If paid or confirmed -->
                    @if (booking.status === 'Confirmed' || booking.paymentStatus === 'Paid') {
                      <button type="button" class="btn btn-secondary btn-sm" (click)="openReceipt(booking)">
                        <i class="fa-solid fa-receipt me-1"></i> Receipt
                      </button>
                    }

                    <!-- View Details (Secondary) -->
                    <a [routerLink]="['/my-bookings', booking.id]" class="btn btn-secondary btn-sm">
                      <i class="fa-solid fa-eye me-1"></i> View Details
                    </a>

                    <!-- Cancel Booking (Danger) - If not already cancelled -->
                    @if (booking.status !== 'Cancelled') {
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        [disabled]="cancellingId() === booking.id"
                        (click)="confirmCancel(booking)">
                        @if (cancellingId() === booking.id) {
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
        }
      </div>
    </div>

    <!-- Digital Receipt Modal -->
    <app-digital-receipt
      [isOpen]="showReceipt"
      [booking]="selectedBooking"
      (closeReceipt)="showReceipt = false">
    </app-digital-receipt>

    <!-- Cancel Confirmation Modal -->
    @if (bookingToCancel) {
      <div class="modal-overlay" (click)="bookingToCancel = null">
        <div class="card p-4 modal-box" (click)="$event.stopPropagation()">
          <div class="d-flex align-items-center gap-3 mb-3 text-danger">
            <i class="fa-solid fa-triangle-exclamation fs-3"></i>
            <h3 class="mb-0 text-main">Cancel Booking</h3>
          </div>
          <p class="text-muted mb-4">
            Are you sure you want to cancel booking <strong class="text-main font-mono">{{ bookingToCancel.bookingNumber }}</strong> for <strong class="text-main">{{ bookingToCancel.eventName }}</strong>? This action will release all reserved seats and parking allocations.
          </p>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" (click)="bookingToCancel = null" [disabled]="cancellingId() !== null">
              Back
            </button>
            <button
              type="button"
              class="btn btn-danger"
              [disabled]="cancellingId() !== null"
              (click)="executeCancel()">
              @if (cancellingId() !== null) {
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
    .page-title { font-size: 1.875rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }
    .font-mono { font-family: monospace; letter-spacing: 0.5px; }

    /* Tabs */
    .booking-tabs { display: flex; border-bottom: 1px solid var(--border-subtle); }
    .tab-btn {
      padding: 0.7rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      cursor: pointer;
      font-family: var(--font-body);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      white-space: nowrap;
    }
    .tab-btn:hover { color: var(--text-main); }
    .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

    /* Booking cards */
    .booking-card-thumb {
      width: 90px;
      height: 90px;
      border-radius: var(--radius-md);
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid var(--border-subtle);
    }
    .booking-event-title { font-size: 1.05rem; font-weight: 700; color: var(--text-main); line-height: 1.35; }
    .booking-item-card {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xs);
      transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    }
    .booking-item-card:hover {
      transform: translateY(-3px);
      border-color: var(--border-medium);
      box-shadow: var(--shadow-md);
    }
    .text-xs { font-size: 0.725rem; }
    .modal-box {
      width: 100%;
      max-width: 480px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  bookings = signal<CustomerBookingDto[]>([]);
  loading = signal<boolean>(true);
  cancellingId = signal<number | null>(null);
  activeTab = signal<'upcoming' | 'past'>('upcoming');

  showReceipt = false;
  selectedBooking: CustomerBookingDto | null = null;
  bookingToCancel: CustomerBookingDto | null = null;

  upcomingBookings = computed(() => {
    const list = this.bookings();
    const now = Date.now();
    return list.filter(b => new Date(b.eventDate).getTime() >= now && b.status !== 'Cancelled');
  });

  pastBookings = computed(() => {
    const list = this.bookings();
    const now = Date.now();
    return list.filter(b => new Date(b.eventDate).getTime() < now || b.status === 'Cancelled');
  });

  displayedBookings = computed(() => {
    return this.activeTab() === 'upcoming' ? this.upcomingBookings() : this.pastBookings();
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.bookings.set([]);
        this.loading.set(false);
      }
    });
  }

  openReceipt(booking: CustomerBookingDto): void {
    this.selectedBooking = booking;
    this.showReceipt = true;
  }

  confirmCancel(booking: CustomerBookingDto): void {
    this.bookingToCancel = booking;
  }

  executeCancel(): void {
    if (!this.bookingToCancel) return;
    const booking = this.bookingToCancel;
    this.cancellingId.set(booking.id);

    this.bookingService.cancelBooking(booking.id).subscribe({
      next: () => {
        this.toastService.success(`Booking ${booking.bookingNumber} has been cancelled.`);
        this.cancellingId.set(null);
        this.bookingToCancel = null;
        this.loadBookings();
      },
      error: (err) => {
        const errorMsg = err?.error?.Message || err?.error?.message || 'Failed to cancel booking.';
        this.toastService.error(errorMsg);
        this.cancellingId.set(null);
      }
    });
  }
}

export const MyReservationsComponent = MyBookingsComponent;
export type MyReservationsComponent = MyBookingsComponent;
export const CustomerMyBookingsComponent = MyBookingsComponent;
export type CustomerMyBookingsComponent = MyBookingsComponent;
