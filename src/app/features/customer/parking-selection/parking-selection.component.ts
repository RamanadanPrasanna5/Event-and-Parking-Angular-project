import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ParkingService } from '../../../core/services/parking.service';
import { EventService } from '../../../core/services/event.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { ParkingSlotDto } from '../../../core/models/parking.model';
import { EventDto } from '../../../core/models/event.model';
import { SlotCodePipe } from '../../../shared/pipes/slot-code.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-parking-selection, app-parking-slots',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SlotCodePipe,
    LoadingComponent,
    ErrorBannerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="page-wrapper">
      <div class="container py-4">
        <!-- Breadcrumb & Back -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <a [routerLink]="['/events', eventId, 'seats']" class="back-link d-inline-flex align-items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back to seat selection
          </a>
          @if (event()) {
            <span class="badge badge-primary">{{ event()!.title }}</span>
          }
        </div>

        <!-- Header -->
        <div class="text-center mb-4">
          <span class="badge badge-gold mb-2">Step 2 of 3 (Optional)</span>
          <h1 class="page-title mb-1">Select A Parking Bay</h1>
          <p class="text-muted">Guarantee your venue parking space alongside your tickets</p>
        </div>

        <!-- Legend -->
        <div class="card p-3 legend-bar mb-4 mx-auto">
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-4">
            <div class="d-flex align-items-center gap-2">
              <span class="legend-indicator available"></span>
              <span class="legend-text">Available Bay</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="legend-indicator selected"></span>
              <span class="legend-text">Selected Bay</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="legend-indicator occupied"></span>
              <span class="legend-text">Occupied / Reserved</span>
            </div>
          </div>
        </div>

        @if (loading()) {
          <app-loading message="Loading available parking bays..."></app-loading>
        } @else if (error()) {
          <app-error-banner [message]="error()!" (retry)="loadSlots()"></app-error-banner>
        } @else if (slots().length === 0) {
          <app-empty-state
            icon="fa-solid fa-square-parking"
            title="No Parking Layout Configured"
            message="There are no parking bays configured for this event. You can continue directly to reservation summary."
            actionLabel="Proceed to Reservation Summary"
            (actionClicked)="proceedToCheckout()">
          </app-empty-state>
        } @else {
          <!-- Zone Filter Tabs -->
          @if (zones().length > 1) {
            <div class="d-flex justify-content-center gap-2 mb-4 flex-wrap">
              <button
                class="btn btn-sm"
                [class.btn-primary]="selectedZone() === 'ALL'"
                [class.btn-secondary]="selectedZone() !== 'ALL'"
                (click)="selectedZone.set('ALL')">
                All Zones ({{ slots().length }})
              </button>
              @for (z of zones(); track z) {
                <button
                  class="btn btn-sm"
                  [class.btn-primary]="selectedZone() === z"
                  [class.btn-secondary]="selectedZone() !== z"
                  (click)="selectedZone.set(z)">
                  Zone {{ z }}
                </button>
              }
            </div>
          }

          <!-- PARKING LOT VISUALIZER -->
          <div class="parking-lot-card card p-4 mb-4">
            <div class="parking-lot-entry mb-4 text-center">
              <span class="lot-entry-badge">
                <i class="fa-solid fa-arrow-down me-1"></i> VEHICLE ENTRY & GATE
              </span>
            </div>

            <!-- Parking Bay Grid -->
            <div class="parking-grid">
              @for (slot of filteredSlots(); track slot.id) {
                <div
                  class="parking-bay"
                  [class.bay-available]="slot.status === 'Available' && !isSlotSelected(slot.id)"
                  [class.bay-selected]="isSlotSelected(slot.id)"
                  [class.bay-occupied]="slot.status !== 'Available'"
                  (click)="onSlotClick(slot)">
                  <!-- Road line demarcations -->
                  <div class="bay-car-icon mb-1">
                    <i class="fa-solid fa-car-side"></i>
                  </div>
                  <div class="bay-code">{{ slot.zone }}-{{ slot.slotNumber < 10 ? '0' + slot.slotNumber : slot.slotNumber }}</div>
                  <div class="bay-fee">LKR {{ slot.fee }}</div>

                  @if (isSlotSelected(slot.id)) {
                    <div class="selected-check">
                      <i class="fa-solid fa-check"></i>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- SUMMARY & ACTIONS BAR -->
          <div class="card p-3 p-md-4 summary-bar">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <span class="text-dim text-uppercase font-bold text-sm letter-spacing-1 d-block mb-1">Selected Parking Bay:</span>
                @if (bookingState.selectedParking()) {
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge badge-gold">
                      <i class="fa-solid fa-car me-1"></i>
                      {{ bookingState.selectedParking() | slotCode }} (LKR {{ bookingState.parkingFee() }})
                    </span>
                    <button class="btn btn-sm btn-secondary py-0 px-2" (click)="bookingState.clearParkingSlot()">
                      Remove
                    </button>
                  </div>
                } @else {
                  <span class="text-muted fst-italic">No parking selected (Optional)</span>
                }
              </div>

              <div class="d-flex align-items-center gap-3 flex-wrap">
                <div class="text-end">
                  <small class="text-dim d-block text-uppercase letter-spacing-1">Combined Total</small>
                  <strong class="total-amount">LKR {{ bookingState.grandTotal() | number }}</strong>
                </div>

                <button class="btn btn-primary btn-lg" (click)="proceedToCheckout()">
                  Confirm & Review Order <i class="fa-solid fa-arrow-right ms-1"></i>
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
      max-width: 600px;
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
      background: var(--accent);
      border: 1px solid var(--accent);
      box-shadow: 0 0 10px var(--accent-gold-glow);
    }
    .legend-indicator.occupied {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
    }
    .legend-text {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .parking-lot-card {
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .parking-lot-entry {
      border-bottom: 2px dashed var(--border-medium);
      padding-bottom: 1.25rem;
    }
    .lot-entry-badge {
      background: var(--primary-subtle);
      border: 1px solid var(--border-medium);
      padding: 0.4rem 1.2rem;
      border-radius: var(--radius-pill);
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 1.5px;
    }
    .parking-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
      gap: 1rem;
    }
    .parking-bay {
      background: var(--bg-card);
      border: 2px dashed var(--border-medium);
      border-radius: var(--radius-md);
      padding: 1rem 0.5rem;
      text-align: center;
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
      user-select: none;
    }
    .bay-car-icon {
      font-size: 1.35rem;
      color: var(--text-dim);
    }
    .bay-code {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--text-main);
    }
    .bay-fee {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Available Bay */
    .bay-available {
      border-color: var(--border-medium);
      background: var(--primary-subtle);
    }
    .bay-available:hover {
      border-color: var(--primary);
      background: var(--primary-subtle);
      transform: translateY(-2px);
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .bay-available:hover .bay-car-icon {
      color: var(--primary);
    }

    /* Selected Bay */
    .bay-selected {
      background: var(--accent-subtle) !important;
      border: 2px solid var(--accent) !important;
      transform: scale(1.06);
      box-shadow: 0 0 16px var(--accent-gold-glow);
    }
    .bay-selected .bay-car-icon {
      color: var(--accent);
    }
    .selected-check {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--accent);
      color: #1F2722;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }

    /* Occupied Bay */
    .bay-occupied {
      background: rgba(0, 0, 0, 0.04);
      border-color: rgba(0, 0, 0, 0.1);
      opacity: 0.45;
      cursor: not-allowed;
    }
    .bay-occupied .bay-car-icon {
      color: var(--danger);
    }

    .summary-bar {
      position: sticky;
      bottom: 20px;
      z-index: 800;
      border: 1px solid var(--border-medium);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }
    .total-amount {
      font-size: 1.45rem;
      color: var(--primary);
      font-family: var(--font-heading);
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

  eventId!: number;
  event = signal<EventDto | null>(null);
  slots = signal<ParkingSlotDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  selectedZone = signal<string>('ALL');

  zones = computed(() => {
    const list = this.slots();
    const unique = Array.from(new Set(list.map(s => s.zone)));
    return unique.sort();
  });

  filteredSlots = computed(() => {
    const z = this.selectedZone();
    if (z === 'ALL') return this.slots();
    return this.slots().filter(s => s.zone === z);
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('eventId');
    if (idParam) {
      this.eventId = parseInt(idParam, 10);
      this.loadEvent();
      this.loadSlots();
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

  loadSlots(): void {
    this.loading.set(true);
    this.error.set(null);

    this.parkingService.getSlots(this.eventId).subscribe({
      next: (data) => {
        this.slots.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load parking layout for this event.');
      }
    });
  }

  isSlotSelected(slotId: number): boolean {
    return this.bookingState.selectedParking()?.id === slotId;
  }

  onSlotClick(slot: ParkingSlotDto): void {
    if (slot.status !== 'Available') {
      this.toastService.warning(`Parking Bay ${slot.zone}-${slot.slotNumber} is already occupied.`);
      return;
    }

    if (this.isSlotSelected(slot.id)) {
      this.bookingState.clearParkingSlot();
      this.toastService.info(`Removed Parking Bay ${slot.zone}-${slot.slotNumber}.`);
    } else {
      this.bookingState.setParkingSlot(slot);
      this.toastService.info(`Selected Parking Bay ${slot.zone}-${slot.slotNumber}.`);
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/reservations/make-reservation']);
  }
}

export const ParkingSlotsComponent = ParkingSelectionComponent;
export type ParkingSlotsComponent = ParkingSelectionComponent;
