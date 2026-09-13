import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerBookingDto } from '../../../core/models/booking.model';
import { BookingStatusBadgePipe } from '../../../shared/pipes/booking-status.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-my-bookings, app-my-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BookingStatusBadgePipe,
    LoadingComponent,
    EmptyStateComponent,
    ErrorBannerComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="page-wrapper">
      <div class="container py-4">
        <!-- Page Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span class="badge badge-gold mb-2">Order History</span>
            <h1 class="page-title mb-1">My Reservations</h1>
            <p class="text-muted mb-0">View, manage, or cancel your booked event seats and parking bays</p>
          </div>
          <a routerLink="/events" class="btn btn-primary">
            <i class="fa-solid fa-plus me-1"></i> Book Another Event
          </a>
        </div>

        @if (loading()) {
          <app-loading message="Loading your bookings..."></app-loading>
        } @else if (error()) {
          <app-error-banner [message]="error()!" (retry)="loadBookings()"></app-error-banner>
        } @else if (bookings().length === 0) {
          <app-empty-state
            icon="fa-solid fa-ticket"
            title="No Reservations Yet"
            message="You haven't made any event or parking reservations yet. Find an upcoming event and reserve your preferred seats."
            actionLabel="Browse Events"
            (actionClicked)="navigateToEvents()">
          </app-empty-state>
        } @else {
          <!-- Responsive Table -->
          <div class="card p-0 overflow-hidden mb-4">
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Event Details</th>
                    <th>Date & Time</th>
                    <th>Seats Booked</th>
                    <th>Parking Bay</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (booking of bookings(); track booking.id) {
                    <tr>
                      <td>
                        <strong class="font-mono text-primary">{{ booking.bookingNumber }}</strong>
                      </td>
                      <td>
                        <div class="font-bold text-main font-heading">{{ booking.eventName }}</div>
                      </td>
                      <td>
                        <small class="text-dim">
                          {{ booking.eventDate | date:'mediumDate' }}
                        </small>
                      </td>
                      <td>
                        <div class="d-flex flex-wrap gap-1">
                          @for (seat of booking.seatNumbers; track seat) {
                            <span class="badge badge-primary">{{ seat }}</span>
                          }
                        </div>
                      </td>
                      <td>
                        @if (booking.parkingDetails && booking.parkingDetails !== 'None') {
                          <span class="badge badge-gold">
                            <i class="fa-solid fa-car me-1"></i> {{ booking.parkingDetails }}
                          </span>
                        } @else {
                          <span class="text-dim">None</span>
                        }
                      </td>
                      <td>
                        <strong class="text-primary">LKR {{ booking.totalPrice | number }}</strong>
                      </td>
                      <td>
                        <span class="badge" [ngClass]="booking.status | bookingStatusBadge">
                          {{ booking.status }}
                        </span>
                      </td>
                      <td class="text-end">
                        @if (booking.status === 'Pending' || booking.status === 'Confirmed') {
                          <button
                            class="btn btn-sm btn-secondary text-danger"
                            title="Cancel Booking"
                            (click)="promptCancel(booking)">
                            <i class="fa-solid fa-ban me-1"></i> Cancel
                          </button>
                        } @else {
                          <span class="text-dim text-sm">Inactive</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Cancellation Confirmation Dialog -->
        <app-confirmation-dialog
          [isOpen]="showCancelModal"
          title="Cancel Reservation"
          [message]="'Are you sure you want to cancel booking ' + (selectedBooking?.bookingNumber || '') + '? All reserved seats and parking bays will be released immediately.'"
          confirmText="Yes, Cancel Booking"
          [isDanger]="true"
          [isLoading]="cancelling()"
          (confirm)="confirmCancellation()"
          (cancel)="showCancelModal = false">
        </app-confirmation-dialog>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-family: var(--font-heading);
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .font-mono {
      font-family: monospace;
      letter-spacing: 0.5px;
    }
  `]
})
export class MyBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  bookings = signal<CustomerBookingDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  cancelling = signal<boolean>(false);

  showCancelModal: boolean = false;
  selectedBooking: CustomerBookingDto | null = null;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load your reservations. Please check connection to the backend.');
      }
    });
  }

  promptCancel(booking: CustomerBookingDto): void {
    this.selectedBooking = booking;
    this.showCancelModal = true;
  }

  confirmCancellation(): void {
    if (!this.selectedBooking) return;

    this.cancelling.set(true);
    this.bookingService.cancelBooking(this.selectedBooking.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.showCancelModal = false;
        this.toastService.success(`Booking ${this.selectedBooking!.bookingNumber} has been cancelled.`);
        this.selectedBooking = null;
        this.loadBookings();
      },
      error: (err) => {
        this.cancelling.set(false);
        const msg = err.error?.message || 'Failed to cancel booking.';
        this.toastService.error(msg);
      }
    });
  }

  navigateToEvents(): void {
    this.router.navigate(['/events']);
  }
}

export const MyReservationsComponent = MyBookingsComponent;
export type MyReservationsComponent = MyBookingsComponent;
export const CustomerMyBookingsComponent = MyBookingsComponent;
export type CustomerMyBookingsComponent = MyBookingsComponent;
export const BookingsComponent = MyBookingsComponent;
export type BookingsComponent = MyBookingsComponent;
