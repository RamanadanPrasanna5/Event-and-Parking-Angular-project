import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeatService } from '../../../core/services/seat.service';
import { EventService } from '../../../core/services/event.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { SeatDto } from '../../../core/models/seat.model';
import { EventDto } from '../../../core/models/event.model';
import { SeatItemComponent } from '../../seats/seat-item/seat-item.component';
import { SeatLabelPipe } from '../../../shared/pipes/seat-label.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-seat-selection, app-seat-map',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SeatItemComponent,
    SeatLabelPipe,
    LoadingComponent,
    ErrorBannerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page-wrapper">
      <div class="container py-4">
        <!-- Breadcrumb & Back -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <a [routerLink]="['/events', eventId]" class="back-link d-inline-flex align-items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to event details
          </a>
          @if (event()) {
            <span class="badge badge-primary">{{ event()!.title }}</span>
          }
        </div>

        <!-- Section Title -->
        <div class="text-center mb-4">
          <span class="badge badge-gold mb-2">Step 1 of 3</span>
          <h1 class="page-title mb-1">Select Your Seats</h1>
          <p class="text-muted">Click any available seat to add it to your reservation</p>
        </div>

        <!-- Legend -->
        <div class="card p-3 legend-bar mb-4 mx-auto">
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <div class="d-flex align-items-center gap-2">
              <span class="legend-indicator available"></span>
              <span class="legend-text">Available</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="legend-indicator selected"></span>
              <span class="legend-text">Selected (Your Pick)</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="legend-indicator booked"></span>
              <span class="legend-text">Booked / Occupied</span>
            </div>
          </div>
        </div>

        <!-- Seat Grid States -->
        @if (loading()) {
          <app-loading message="Loading interactive seat grid..."></app-loading>
        } @else if (error()) {
          <app-error-banner [message]="error()!" (retry)="loadSeats()"></app-error-banner>
        } @else if (seats().length === 0) {
          <app-empty-state
            icon="fa-solid fa-couch"
            title="No Seats Configured"
            message="This event does not have an active seating map yet. Please check back later or contact the organizer.">
          </app-empty-state>
        } @else {
          <!-- STAGE VISUALIZER -->
          <div class="seat-map-viewport card p-4 mb-4">
            <div class="stage-container mb-5">
              <div class="stage-curve">
                <span class="stage-label"><i class="fa-solid fa-volume-high me-2"></i>STAGE / PERFORMANCE AREA</span>
              </div>
            </div>

            <!-- Scrollable Grid Container -->
            <div class="seat-grid-scroll-wrapper">
              <div class="seat-rows-container d-flex flex-column gap-3 align-items-center">
                @for (rowName of rows(); track rowName) {
                  <div class="seat-row d-flex align-items-center gap-2">
                    <span class="row-label">{{ rowName }}</span>

                    <div class="row-seats d-flex gap-2">
                      @for (seat of getSeatsInRow(rowName); track seat.id) {
                        <app-seat-item
                          [seat]="seat"
                          [isSelected]="bookingState.isSeatSelected(seat.id)"
                          (seatClicked)="onSeatToggle($event)">
                        </app-seat-item>
                      }
                    </div>

                    <span class="row-label">{{ rowName }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- FLOATING RUNNING TOTAL BAR -->
          <div class="selection-summary-bar card p-3 p-md-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <!-- Selected List Chips -->
              <div class="flex-grow-1">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="text-dim text-uppercase font-bold text-sm letter-spacing-1">Selected Seats:</span>
                  @if (bookingState.seatsCount() === 0) {
                    <span class="text-muted fst-italic">None selected yet</span>
                  } @else {
                    <span class="badge badge-gold">{{ bookingState.seatsCount() }} seats</span>
                  }
                </div>

                @if (bookingState.seatsCount() > 0) {
                  <div class="d-flex flex-wrap gap-1 mt-2">
                    @for (seat of bookingState.selectedSeats(); track seat.id) {
                      <span class="selected-seat-chip d-inline-flex align-items-center gap-1">
                        {{ seat | seatLabel }}
                        <button type="button" class="chip-remove" (click)="bookingState.removeSeat(seat.id)">
                          &times;
                        </button>
                      </span>
                    }
                  </div>
                }
              </div>

              <!-- Running Total & Actions -->
              <div class="d-flex align-items-center gap-4 flex-wrap">
                <div class="total-display text-end">
                  <small class="text-dim d-block text-uppercase letter-spacing-1">Tickets Total</small>
                  <strong class="total-amount">LKR {{ bookingState.seatsTotal() | number }}</strong>
                </div>

                <div class="d-flex gap-2">
                  <button
                    class="btn btn-secondary"
                    [disabled]="!bookingState.hasSelection()"
                    (click)="proceedToReservation()">
                    Skip Parking
                  </button>

                  <button
                    class="btn btn-primary"
                    [disabled]="!bookingState.hasSelection()"
                    (click)="proceedToParking()">
                    <i class="fa-solid fa-car me-1"></i> Add Parking Bay <i class="fa-solid fa-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
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
    .back-link {
      color: var(--text-muted);
      font-size: 0.9rem;
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .back-link:hover {
      color: var(--primary);
    }
    .legend-bar {
      max-width: 620px;
      border: 1px solid var(--border-medium);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
    .legend-indicator {
      width: 16px;
      height: 16px;
      border-radius: 4px;
      display: inline-block;
    }
    .legend-indicator.available {
      background: var(--primary-subtle);
      border: 1px solid var(--border-medium);
    }
    .legend-indicator.selected {
      background: var(--primary);
      border: 1px solid var(--accent);
      box-shadow: 0 0 10px var(--accent-gold-glow);
    }
    .legend-indicator.booked {
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
    }
    .legend-text {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .seat-map-viewport {
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .stage-container {
      max-width: 580px;
      margin: 0 auto;
      text-align: center;
    }
    .stage-curve {
      height: 44px;
      background: linear-gradient(180deg, var(--primary-subtle) 0%, transparent 100%);
      border-top: 3px solid var(--primary);
      border-radius: 50% 50% 0 0 / 100% 100% 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 -8px 25px var(--primary-glow);
    }
    .stage-label {
      font-family: var(--font-heading);
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: var(--primary);
    }
    .seat-grid-scroll-wrapper {
      width: 100%;
      overflow-x: auto;
      padding: 1rem 0.5rem 2rem;
    }
    .row-label {
      width: 24px;
      text-align: center;
      font-weight: 700;
      color: var(--text-dim);
      font-size: 0.85rem;
    }
    .selection-summary-bar {
      position: sticky;
      bottom: 20px;
      z-index: 800;
      border: 1px solid var(--border-medium);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }
    .selected-seat-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .chip-remove {
      background: none;
      border: none;
      color: var(--danger);
      font-size: 1rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 2px;
    }
    .total-amount {
      font-size: 1.45rem;
      color: var(--primary);
      font-family: var(--font-heading);
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

  eventId!: number;
  event = signal<EventDto | null>(null);
  seats = signal<SeatDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  rows = computed(() => {
    const list = this.seats();
    const uniqueRows = Array.from(new Set(list.map(s => s.row)));
    return uniqueRows.sort();
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('eventId');
    if (idParam) {
      this.eventId = parseInt(idParam, 10);
      this.loadEvent();
      this.loadSeats();
    } else {
      this.error.set('Missing Event ID in route.');
      this.loading.set(false);
    }
  }

  loadEvent(): void {
    this.eventService.getEventById(this.eventId).subscribe({
      next: (ev) => {
        this.event.set(ev);
        this.bookingState.setEvent(ev);
      },
      error: () => {}
    });
  }

  loadSeats(): void {
    this.loading.set(true);
    this.error.set(null);

    this.seatService.getSeats(this.eventId).subscribe({
      next: (data) => {
        this.seats.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load seating grid for this event.');
      }
    });
  }

  getSeatsInRow(row: string): SeatDto[] {
    return this.seats()
      .filter(s => s.row === row)
      .sort((a, b) => a.seatNumber - b.seatNumber);
  }

  onSeatToggle(seat: SeatDto): void {
    if (seat.status === 'Booked') {
      this.toastService.warning(`Seat ${seat.row}-${seat.seatNumber} is already booked.`);
      return;
    }

    const added = this.bookingState.toggleSeat(seat);
    if (added) {
      this.toastService.info(`Added Seat ${seat.row}-${seat.seatNumber} to selection.`);
    } else {
      this.toastService.info(`Removed Seat ${seat.row}-${seat.seatNumber}.`);
    }
  }

  proceedToParking(): void {
    if (!this.bookingState.hasSelection()) {
      this.toastService.warning('Please select at least one seat before continuing.');
      return;
    }
    this.router.navigate(['/events', this.eventId, 'parking']);
  }

  proceedToReservation(): void {
    if (!this.bookingState.hasSelection()) {
      this.toastService.warning('Please select at least one seat before continuing.');
      return;
    }
    this.router.navigate(['/reservations/make-reservation']);
  }
}

export const SeatMapComponent = SeatSelectionComponent;
export type SeatMapComponent = SeatSelectionComponent;
