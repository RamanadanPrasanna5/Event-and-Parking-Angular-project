import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeatService } from '../../../core/services/seat.service';
import { EventService } from '../../../core/services/event.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { SeatDto } from '../../../core/models/seat.model';
import { EventDto } from '../../../core/models/event.model';
import { BookingProgressComponent } from '../../../shared/components/booking-progress/booking-progress.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-seat-selection, app-seat-map',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BookingProgressComponent,
    LoadingComponent
  ],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <!-- Booking Step Progress Indicator -->
        <app-booking-progress currentStep="seats"></app-booking-progress>

        <!-- Back to event header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <a [routerLink]="['/events', eventId]" class="back-link d-inline-flex align-items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to Event Details
          </a>
          @if (event()) {
            <span class="badge badge-primary">{{ event()!.title }}</span>
          }
        </div>

        <!-- Section Title -->
        <div class="text-center mb-4">
          <h1 class="page-title mb-1 text-main">Select Your Seats</h1>
          <p class="text-muted">Choose your preferred seating position facing the main stage</p>
        </div>

        <!-- Visual Legend Bar -->
        <div class="card p-3 legend-bar mb-4 mx-auto">
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <div class="d-flex align-items-center gap-2">
              <span class="legend-box state-available"></span>
              <span class="legend-text">Available</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="legend-box state-selected"></span>
              <span class="legend-text">Selected</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="legend-box state-booked"></span>
              <span class="legend-text">Booked</span>
            </div>
          </div>
        </div>

        @if (loading()) {
          <app-loading message="Rendering interactive seat map..."></app-loading>
        } @else {
          <!-- INTERACTIVE STAGE & SEAT MAP VIEWPORT -->
          <div class="seat-map-viewport card p-4 p-md-5 mb-4 text-center">
            <!-- Stage Element -->
            <div class="stage-container mx-auto mb-5">
              <div class="stage-curve">
                <span class="stage-label"><i class="fa-solid fa-volume-high me-2"></i>STAGE</span>
              </div>
            </div>

            <!-- Seat Rows Grid -->
            <div class="seat-grid-scroll-wrapper">
              <div class="seat-rows-container d-flex flex-column gap-3 align-items-center">
                @for (row of rows(); track row) {
                  <div class="seat-row d-flex align-items-center gap-2">
                    <span class="row-label">{{ row }}</span>

                    <div class="row-seats d-flex gap-2">
                      @for (seat of getSeatsInRow(row); track seat.id) {
                        <button
                          type="button"
                          class="seat-btn"
                          [class.seat-available]="seat.status === 'Available' && !bookingState.isSeatSelected(seat.id)"
                          [class.seat-selected]="bookingState.isSeatSelected(seat.id)"
                          [class.seat-booked]="seat.status !== 'Available'"
                          [disabled]="seat.status !== 'Available'"
                          (click)="onSeatClick(seat)"
                          [title]="seat.status !== 'Available' ? 'Seat ' + seat.row + seat.seatNumber + ' is Booked/Unavailable' : 'Seat ' + seat.row + seat.seatNumber + ' (LKR ' + seat.price + ')'">
                          <span class="seat-inner-label">{{ seat.row }}{{ seat.seatNumber }}</span>
                        </button>
                      }
                    </div>

                    <span class="row-label">{{ row }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- SELECTION SUMMARY BAR -->
          <div class="selection-summary-bar card p-3 p-md-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <!-- Selected Seats & Ticket Count -->
              <div class="flex-grow-1" style="min-width: 250px;">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="text-muted text-uppercase font-bold text-sm">Selected Seats:</span>
                  @if (bookingState.seatsCount() === 0) {
                    <span class="text-muted fst-italic">None selected yet</span>
                  } @else {
                    <span class="selected-text font-bold text-main">
                      {{ getSelectedSeatLabels() }}
                    </span>
                  }
                </div>

                <div class="d-flex align-items-center gap-4 text-sm">
                  <div>
                    <span class="text-muted">Tickets: </span>
                    <strong class="text-main">{{ bookingState.seatsCount() }}</strong>
                  </div>
                  <div>
                    <span class="text-muted">Ticket Price: </span>
                    <strong class="text-main">LKR {{ averageSeatPrice() | number }}</strong>
                  </div>
                </div>
              </div>

              <!-- Total and Continue CTA -->
              <div class="d-flex align-items-center gap-4 flex-wrap">
                <div class="total-box text-end">
                  <small class="text-muted d-block text-uppercase">Total</small>
                  <strong class="total-figure text-primary">LKR {{ bookingState.seatsTotal() | number }}</strong>
                </div>

                <!-- [ Continue to Parking ] Button navigates to /booking/parking/:eventId -->
                <button
                  class="btn btn-primary btn-lg"
                  [disabled]="!bookingState.hasSelection()"
                  (click)="proceedToParking()">
                  Continue to Parking <i class="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-main);
    }
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
    .legend-bar {
      max-width: 500px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }
    .legend-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: inline-block;
    }
    .legend-box.state-available {
      background: #FFFFFF;
      border: 2px solid #CBD5E1;
    }
    .legend-box.state-selected {
      background: var(--primary);
      border: 2px solid var(--primary);
    }
    .legend-box.state-booked {
      background: #F1F5F9;
      border: 2px solid #E2E8F0;
    }
    .legend-text {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .seat-map-viewport {
      background: var(--bg-card);
      border-radius: var(--radius-xl);
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
    }
    .stage-container {
      max-width: 580px;
    }
    .stage-curve {
      height: 42px;
      background: linear-gradient(180deg, var(--primary-subtle) 0%, transparent 100%);
      border-top: 4px solid var(--primary);
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 -4px 12px rgba(15, 118, 110, 0.12);
    }
    .stage-label {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 3px;
      color: var(--primary);
    }
    .seat-grid-scroll-wrapper {
      width: 100%;
      overflow-x: auto;
      padding: 1rem 0;
    }
    .row-label {
      width: 24px;
      text-align: center;
      font-weight: 800;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .seat-btn {
      width: 44px;
      height: 40px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: var(--font-heading);
      font-size: 0.75rem;
      font-weight: 700;
      transition: all var(--transition-fast);
      user-select: none;
    }
    /* AVAILABLE SEAT */
    .seat-btn.seat-available {
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      color: var(--text-main);
    }
    .seat-btn.seat-available:hover {
      background: var(--primary-subtle);
      border-color: var(--primary);
      color: var(--primary);
      transform: scale(1.08);
      box-shadow: var(--shadow-sm);
    }
    /* SELECTED SEAT */
    .seat-btn.seat-selected {
      background: var(--primary) !important;
      border: 2px solid var(--primary) !important;
      color: #FFFFFF !important;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
    }
    /* BOOKED SEAT */
    .seat-btn.seat-booked {
      background: #F1F5F9;
      border: 1.5px solid #E2E8F0;
      color: #94A3B8;
      cursor: not-allowed;
      opacity: 0.6;
    }
    .selection-summary-bar {
      position: sticky;
      bottom: 74px;
      z-index: 800;
      border: 1px solid var(--border-subtle);
      background: #FFFFFF;
      box-shadow: var(--shadow-lg);
    }
    @media (min-width: 768px) {
      .selection-summary-bar {
        bottom: 20px;
      }
    }
    .total-figure {
      font-size: 1.6rem;
      font-family: var(--font-heading);
    }
    .selected-text {
      color: var(--primary);
      font-size: 1rem;
    }
  `]
})
export class SeatSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seatService = inject(SeatService);
  private eventService = inject(EventService);
  bookingState = inject(BookingStateService);
  private toastService = inject(ToastService);

  eventId: number = 1;
  event = signal<EventDto | null>(null);
  seats = signal<SeatDto[]>([]);
  loading = signal<boolean>(true);

  rows = computed(() => {
    const list = this.seats();
    const unique = Array.from(new Set(list.map(s => s.row)));
    return unique.sort();
  });

  averageSeatPrice = computed(() => {
    const selected = this.bookingState.selectedSeats();
    if (selected.length === 0) {
      return this.seats()[0]?.price || 3000;
    }
    return Math.round(this.bookingState.seatsTotal() / selected.length);
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('eventId') || this.route.snapshot.paramMap.get('id');
    this.eventId = idParam ? parseInt(idParam, 10) : 1;

    this.eventService.getEventById(this.eventId).subscribe({
      next: ev => {
        this.event.set(ev);
        this.bookingState.setEvent(ev);
      },
      error: () => {}
    });

    this.seatService.getSeats(this.eventId).subscribe({
      next: seats => {
        this.seats.set(seats || []);
        this.loading.set(false);
      },
      error: () => {
        this.seats.set([]);
        this.loading.set(false);
      }
    });
  }

  getSeatsInRow(row: string): SeatDto[] {
    return this.seats()
      .filter(s => s.row === row)
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }

  onSeatClick(seat: SeatDto): void {
    if (seat.status === 'Booked') {
      this.toastService.warning(`Seat ${seat.row}${seat.seatNumber} is booked.`);
      return;
    }

    const added = this.bookingState.toggleSeat(seat);
    if (added) {
      this.toastService.info(`Selected seat ${seat.row}${seat.seatNumber} (LKR ${seat.price}).`);
    } else {
      this.toastService.info(`Removed seat ${seat.row}${seat.seatNumber}.`);
    }
  }

  getSelectedSeatLabels(): string {
    return this.bookingState.selectedSeats().map(s => `${s.row}${s.seatNumber}`).join(', ');
  }

  proceedToParking(): void {
    if (!this.bookingState.hasSelection()) {
      this.toastService.warning('Please select at least one seat to continue.');
      return;
    }
    this.router.navigate(['/booking/parking', this.eventId]);
  }
}
