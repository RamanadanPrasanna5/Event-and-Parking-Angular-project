import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerBookingDto } from '../../../core/models/booking.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-admin-bookings, app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ErrorBannerComponent,
    ConfirmationModalComponent
  ],
  template: `
    <div class="admin-bookings-container">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Operations Control</span>
          <h1 class="page-title mb-1">Customer Bookings</h1>
          <p class="text-muted mb-0">Monitor real-time reservations, ticket assignments, and hold statuses</p>
        </div>

        <button class="btn btn-secondary" (click)="loadBookings()">
          <i class="fa-solid fa-arrows-rotate me-1" [class.fa-spin]="loading()"></i> Refresh Data
        </button>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="metric-card">
            <span class="metric-label">Total Reservations</span>
            <span class="metric-val">{{ bookings().length }}</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <span class="metric-label">Confirmed Bookings</span>
            <span class="metric-val text-success">{{ confirmedCount() }}</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <span class="metric-label">Pending Holds</span>
            <span class="metric-val text-warning">{{ pendingCount() }}</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="metric-card">
            <span class="metric-label">Total Revenue</span>
            <span class="metric-val text-primary">\${{ totalRevenue() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card p-3 mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <input
              type="text"
              class="form-control"
              [(ngModel)]="searchQuery"
              placeholder="Search by Booking Number or Event Name..."
            />
          </div>
          <div class="col-md-3">
            <select class="form-control" [(ngModel)]="statusFilter">
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending / Hold</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading reservations..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadBookings()"></app-error-banner>
      } @else if (filteredBookings().length === 0) {
        <div class="card p-5 text-center">
          <i class="fa-solid fa-calendar-xmark fa-3x text-muted mb-3"></i>
          <h4>No Bookings Found</h4>
          <p class="text-muted">No reservations match the specified search or filter criteria.</p>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Event Name</th>
                  <th>Seats Reserved</th>
                  <th>Parking Details</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (b of filteredBookings(); track b.id) {
                  <tr>
                    <td>
                      <strong>{{ b.bookingNumber || ('#BK-' + b.id) }}</strong>
                      <div class="text-muted small">{{ b.eventDate | date:'medium' }}</div>
                    </td>
                    <td>
                      <div class="fw-bold">{{ b.eventName }}</div>
                    </td>
                    <td>
                      <div class="d-flex flex-wrap gap-1">
                        @for (seat of b.seatNumbers; track seat) {
                          <span class="badge bg-secondary-subtle text-dark border">
                            {{ seat }}
                          </span>
                        }
                      </div>
                    </td>
                    <td>
                      @if (b.parkingDetails) {
                        <span class="badge bg-info-subtle text-info border">
                          <i class="fa-solid fa-square-parking me-1"></i> {{ b.parkingDetails }}
                        </span>
                      } @else {
                        <span class="text-muted small">None</span>
                      }
                    </td>
                    <td>
                      <strong class="text-success">\${{ b.totalPrice | number:'1.2-2' }}</strong>
                    </td>
                    <td>
                      <span [ngClass]="{
                        'badge badge-success': b.status === 'Confirmed',
                        'badge badge-warning': b.status === 'Pending',
                        'badge badge-danger': b.status === 'Cancelled' || b.status === 'Expired'
                      }">
                        {{ b.status }}
                      </span>
                    </td>
                    <td class="text-end">
                      @if (b.status !== 'Cancelled' && b.status !== 'Expired') {
                        <button
                          class="btn btn-sm btn-danger"
                          (click)="openCancelModal(b)"
                          title="Cancel Reservation"
                        >
                          <i class="fa-solid fa-ban"></i> Cancel
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <app-confirmation-modal
        [isOpen]="showCancelModal"
        title="Cancel Booking"
        [message]="'Are you sure you want to cancel booking ' + (selectedBooking?.bookingNumber || selectedBooking?.id) + '? This will immediately release all reserved seats and parking slots.'"
        confirmText="Confirm Cancellation"
        [isDanger]="true"
        [isLoading]="cancelling()"
        (confirm)="confirmCancel()"
        (cancel)="showCancelModal = false"
      >
      </app-confirmation-modal>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-main); }
    .metric-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      box-shadow: var(--shadow-sm);
    }
    .metric-label {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .metric-val {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1;
      color: var(--text-main);
    }
  `]
})
export class BookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private toastService = inject(ToastService);

  bookings = signal<CustomerBookingDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchQuery = '';
  statusFilter = 'ALL';

  showCancelModal = false;
  selectedBooking: CustomerBookingDto | null = null;
  cancelling = signal<boolean>(false);

  confirmedCount = computed(() => this.bookings().filter(b => b.status === 'Confirmed').length);
  pendingCount = computed(() => this.bookings().filter(b => b.status === 'Pending').length);
  totalRevenue = computed(() =>
    this.bookings()
      .filter(b => b.status === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  );

  filteredBookings = computed(() => {
    let list = this.bookings();
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(b =>
        (b.bookingNumber && b.bookingNumber.toLowerCase().includes(q)) ||
        b.id.toString().includes(q) ||
        b.eventName.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter !== 'ALL') {
      list = list.filter(b => b.status === this.statusFilter);
    }

    return list;
  });

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
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load reservations.');
        this.loading.set(false);
      }
    });
  }

  openCancelModal(b: CustomerBookingDto): void {
    this.selectedBooking = b;
    this.showCancelModal = true;
  }

  confirmCancel(): void {
    if (!this.selectedBooking) return;
    this.cancelling.set(true);
    this.bookingService.cancelBooking(this.selectedBooking.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.showCancelModal = false;
        this.toastService.success(`Booking ${this.selectedBooking?.bookingNumber || this.selectedBooking?.id} successfully cancelled.`);
        this.loadBookings();
      },
      error: (err) => {
        this.cancelling.set(false);
        this.toastService.error(err.error?.message || 'Failed to cancel booking.');
      }
    });
  }
}

export { BookingsComponent as AdminBookingsComponent };
