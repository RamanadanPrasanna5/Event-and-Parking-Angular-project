import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParkingService } from '../../../core/services/parking.service';
import { EventService } from '../../../core/services/event.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { ParkingSlotDto } from '../../../core/models/parking.model';
import { EventDto } from '../../../core/models/event.model';
import { BookingProgressComponent } from '../../../shared/components/booking-progress/booking-progress.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-parking-selection, app-parking-slots',
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
        <!-- Progress Step Indicator -->
        <app-booking-progress currentStep="parking"></app-booking-progress>

        <!-- Back to seat selection -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <a [routerLink]="['/booking/seats', eventId]" class="back-link d-inline-flex align-items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to Seat Selection
          </a>
          @if (event()) {
            <span class="badge badge-primary">{{ event()!.title }}</span>
          }
        </div>

        <!-- Initial Decision Prompt: "Do you need parking?" -->
        @if (!showParkingLayout()) {
          <div class="card p-5 text-center mx-auto mb-4" style="max-width: 620px;">
            <div class="parking-prompt-icon mx-auto mb-3">
              <i class="fa-solid fa-square-parking"></i>
            </div>
            <h2 class="text-main mb-2">Do you need parking?</h2>
            <p class="text-muted mb-4">
              Secure an allocated vehicle bay right next to your venue entrance gate. Synchronized with your ticket reservation.
            </p>

            <div class="d-flex flex-wrap justify-content-center gap-3">
              <button class="btn btn-primary btn-lg" (click)="enableParkingLayout()">
                <i class="fa-solid fa-check me-1"></i> Yes, Add Parking
              </button>
              <button class="btn btn-secondary btn-lg" (click)="skipParking()">
                No, Continue Without Parking
              </button>
            </div>
          </div>
        } @else {
          <!-- Parking Selection Title -->
          <div class="text-center mb-4">
            <h1 class="page-title mb-1 text-main">Select A Parking Bay</h1>
            <p class="text-muted">Choose 1 available parking slot for your vehicle</p>
          </div>

          <!-- Legend Bar -->
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
                <span class="legend-box state-unavailable"></span>
                <span class="legend-text">Unavailable</span>
              </div>
            </div>
          </div>

          @if (loading()) {
            <app-loading message="Loading parking bays..."></app-loading>
          } @else {
            <!-- PARKING LOT VISUALIZER -->
            <div class="parking-lot-card card p-4 mb-4">
              <div class="parking-entry-marker mb-4 text-center">
                <span class="entry-badge">
                  <i class="fa-solid fa-arrow-down me-1"></i> GATE ENTRANCE & PARKING LANES
                </span>
              </div>

              <!-- Interactive Bay Grid: P01, P02, P03... -->
              <div class="parking-grid">
                @for (slot of slots(); track slot.id) {
                  <button
                    type="button"
                    class="parking-slot-box"
                    [class.slot-available]="slot.status === 'Available' && !isSlotSelected(slot.id)"
                    [class.slot-selected]="isSlotSelected(slot.id)"
                    [class.slot-unavailable]="slot.status !== 'Available'"
                    [disabled]="slot.status !== 'Available'"
                    (click)="toggleSlot(slot)">
                    <i class="fa-solid fa-car-side slot-icon mb-1"></i>
                    <span class="slot-code">{{ formatSlotCode(slot.slotNumber) }}</span>
                    <small class="slot-zone text-truncate">{{ slot.zone.split(' ')[0] }}</small>
                    <span class="slot-fee">LKR {{ slot.fee }}</span>

                    @if (isSlotSelected(slot.id)) {
                      <div class="selected-pill">
                        <i class="fa-solid fa-check"></i>
                      </div>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- SUMMARY & BOTTOM ACTION BAR -->
            <div class="card p-3 p-md-4 parking-summary-bar">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <span class="text-muted text-uppercase font-bold text-sm">Selected Parking:</span>
                    @if (bookingState.selectedParking()) {
                      <strong class="text-main font-heading">
                        {{ formatSlotCode(bookingState.selectedParking()!.slotNumber) }} ({{ bookingState.selectedParking()!.zone }})
                      </strong>
                    } @else {
                      <span class="text-muted fst-italic">None selected</span>
                    }
                  </div>

                  <div>
                    <span class="text-muted text-sm">Parking Price: </span>
                    <strong class="text-primary text-sm">
                      LKR {{ (bookingState.parkingFee()) | number }}
                    </strong>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-3">
                  <!-- [ Skip Parking ] button -> navigates to /booking/summary -->
                  <button class="btn btn-secondary" (click)="skipParking()">
                    Skip Parking
                  </button>

                  <!-- [ Continue ] button -> navigates to /booking/summary -->
                  <button class="btn btn-primary btn-lg" (click)="continueToSummary()">
                    Continue <i class="fa-solid fa-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); }
    .back-link { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; text-decoration: none; }
    .back-link:hover { color: var(--primary); }
    .parking-prompt-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--primary-subtle);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }
    .legend-bar { max-width: 500px; border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); }
    .legend-box { width: 20px; height: 20px; border-radius: 4px; display: inline-block; }
    .legend-box.state-available { background: #FFFFFF; border: 2px solid #CBD5E1; }
    .legend-box.state-selected { background: var(--primary); border: 2px solid var(--primary); }
    .legend-box.state-unavailable { background: #F1F5F9; border: 2px solid #E2E8F0; }
    .legend-text { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }

    .parking-lot-card {
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
    }
    .entry-badge {
      background: var(--primary-subtle);
      border: 1px solid var(--primary);
      padding: 0.4rem 1.2rem;
      border-radius: var(--radius-pill);
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .parking-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
    }
    .parking-slot-box {
      background: #FFFFFF;
      border: 2px dashed #CBD5E1;
      border-radius: var(--radius-md);
      padding: 1rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
      user-select: none;
    }
    .slot-icon { font-size: 1.4rem; color: var(--text-muted); }
    .slot-code { font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: var(--text-main); }
    .slot-zone { font-size: 0.7rem; color: var(--text-muted); }
    .slot-fee { font-size: 0.8rem; font-weight: 600; color: var(--primary); margin-top: 0.2rem; }

    /* AVAILABLE */
    .parking-slot-box.slot-available {
      border-color: #CBD5E1;
      background: #FFFFFF;
    }
    .parking-slot-box.slot-available:hover {
      border-color: var(--primary);
      background: var(--primary-subtle);
      transform: translateY(-3px);
      box-shadow: var(--shadow-sm);
    }
    .parking-slot-box.slot-available:hover .slot-icon { color: var(--primary); }

    /* SELECTED */
    .parking-slot-box.slot-selected {
      background: var(--primary-subtle) !important;
      border: 2px solid var(--primary) !important;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);
    }
    .parking-slot-box.slot-selected .slot-icon { color: var(--primary); }
    .parking-slot-box.slot-selected .slot-code { color: var(--primary); }

    /* UNAVAILABLE */
    .parking-slot-box.slot-unavailable {
      background: #F1F5F9;
      border-color: #E2E8F0;
      opacity: 0.6;
      cursor: not-allowed;
    }
    .parking-slot-box.slot-unavailable .slot-icon { color: #94A3B8; }

    .selected-pill {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }
    .parking-summary-bar {
      position: sticky;
      bottom: 74px;
      z-index: 800;
      border: 1px solid var(--border-subtle);
      background: #FFFFFF;
      box-shadow: var(--shadow-lg);
    }
    @media (min-width: 768px) {
      .parking-summary-bar { bottom: 20px; }
    }
  `]
})
export class ParkingSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private parkingService = inject(ParkingService);
  private eventService = inject(EventService);
  bookingState = inject(BookingStateService);
  private toastService = inject(ToastService);

  eventId: number = 1;
  event = signal<EventDto | null>(null);
  slots = signal<ParkingSlotDto[]>([]);
  loading = signal<boolean>(true);
  showParkingLayout = signal<boolean>(false);

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

    this.parkingService.getSlots(this.eventId).subscribe({
      next: slots => {
        this.slots.set(slots || []);
        this.loading.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.loading.set(false);
      }
    });

    if (this.bookingState.selectedParking()) {
      this.showParkingLayout.set(true);
    }
  }

  enableParkingLayout(): void {
    this.showParkingLayout.set(true);
  }

  formatSlotCode(slotNumber: number): string {
    return `P${slotNumber < 10 ? '0' + slotNumber : slotNumber}`;
  }

  isSlotSelected(slotId: number): boolean {
    return this.bookingState.selectedParking()?.id === slotId;
  }

  toggleSlot(slot: ParkingSlotDto): void {
    if (slot.status !== 'Available') {
      this.toastService.warning(`Parking Bay ${this.formatSlotCode(slot.slotNumber)} is already occupied.`);
      return;
    }

    if (this.isSlotSelected(slot.id)) {
      this.bookingState.clearParkingSlot();
      this.toastService.info('Removed parking bay selection.');
    } else {
      this.bookingState.setParkingSlot(slot);
      this.toastService.info(`Selected Parking Bay ${this.formatSlotCode(slot.slotNumber)} (LKR ${slot.fee}).`);
    }
  }

  skipParking(): void {
    this.bookingState.clearParkingSlot();
    this.router.navigate(['/booking/summary']);
  }

  continueToSummary(): void {
    this.router.navigate(['/booking/summary']);
  }
}
