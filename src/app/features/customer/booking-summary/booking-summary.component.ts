import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { SeatLabelPipe } from '../../../shared/pipes/seat-label.pipe';
import { SlotCodePipe } from '../../../shared/pipes/slot-code.pipe';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-booking-summary, app-make-reservation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SeatLabelPipe,
    SlotCodePipe,
    ConfirmationDialogComponent,
    ErrorBannerComponent
  ],
  template: `
    <div class="page-wrapper">
      <div class="container py-4">
        <!-- Progress Steps -->
        <div class="checkout-steps mb-5 mx-auto text-center">
          <div class="d-flex justify-content-center align-items-center gap-3">
            <div class="step-indicator" [class.active]="step() === 1" [class.completed]="step() > 1">
              <span class="step-num">1</span>
              <span class="step-name">Review Order</span>
            </div>
            <div class="step-line" [class.filled]="step() > 1"></div>
            <div class="step-indicator" [class.active]="step() === 2" [class.completed]="step() > 2">
              <span class="step-num">2</span>
              <span class="step-name">Payment Simulation</span>
            </div>
          </div>
        </div>

        @if (holdActive()) {
          <!-- 15-MINUTE HOLD COUNTDOWN BANNER -->
          <div class="hold-timer-banner card p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="timer-icon-bubble">
                <i class="fa-solid fa-stopwatch fa-spin" style="--fa-animation-duration: 4s;"></i>
              </div>
              <div>
                <strong class="text-main d-block">Booking Held Pending Payment</strong>
                <small class="text-dim">Booking Ref: <strong class="text-primary">{{ activeHold()?.bookingNumber }}</strong></small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <div class="countdown-clock" [class.urgent]="remainingSeconds() < 120">
                <span class="clock-digits">{{ formattedRemainingTime() }}</span>
              </div>
              <button class="btn btn-sm btn-secondary text-danger" (click)="openCancelHoldModal()">
                Cancel Hold
              </button>
            </div>
          </div>
        }

        @if (errorMessage()) {
          <app-error-banner
            [title]="'Reservation Notice'"
            [message]="errorMessage()!"
            [retryable]="false">
          </app-error-banner>
        }

        <div class="reservation-grid">
          <!-- LEFT: Main Action (Review or Payment Form) -->
          <div class="main-checkout-col">
            @if (step() === 1) {
              <!-- STEP 1: REVIEW SUMMARY -->
              <div class="card p-4 mb-4">
                <h3 class="mb-4 d-flex align-items-center gap-2 section-title-sm">
                  <i class="fa-solid fa-clipboard-check text-primary"></i>
                  Review Your Reservation
                </h3>

                <!-- Event Snapshot -->
                <div class="event-snapshot-card p-3 mb-4 d-flex gap-3 align-items-center">
                  <img
                    [src]="bookingState.currentEvent()?.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300'"
                    alt="Event thumbnail"
                    class="event-mini-thumb" />
                  <div>
                    <span class="badge badge-primary mb-1">{{ bookingState.currentEvent()?.categoryName }}</span>
                    <h4 class="mb-1 text-main font-heading">{{ bookingState.currentEvent()?.title }}</h4>
                    <small class="text-dim d-block">
                      <i class="fa-regular fa-calendar me-1 text-primary"></i>
                      {{ bookingState.currentEvent()?.eventDate | date:'fullDate' }} &bull; {{ bookingState.currentEvent()?.eventDate | date:'shortTime' }}
                    </small>
                    <small class="text-dim d-block">
                      <i class="fa-solid fa-location-dot me-1 text-primary"></i>
                      {{ bookingState.currentEvent()?.venueName }}
                    </small>
                  </div>
                </div>

                <!-- Selected Seats Breakdown -->
                <div class="item-list-box mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0 text-main font-heading">
                      <i class="fa-solid fa-couch text-primary me-1"></i>
                      Selected Seats ({{ bookingState.seatsCount() }})
                    </h5>
                    <a [routerLink]="['/events', bookingState.currentEvent()?.id, 'seats']" class="btn btn-secondary btn-sm">
                      Change Seats
                    </a>
                  </div>

                  <div class="seats-table-responsive">
                    <table class="table-sm-custom w-100">
                      <thead>
                        <tr>
                          <th>Seat</th>
                          <th>Row</th>
                          <th>Seat #</th>
                          <th class="text-end">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (seat of bookingState.selectedSeats(); track seat.id) {
                          <tr>
                            <td><span class="badge badge-primary">{{ seat | seatLabel }}</span></td>
                            <td>Row {{ seat.row }}</td>
                            <td>#{{ seat.seatNumber }}</td>
                            <td class="text-end text-main font-bold">LKR {{ seat.price | number }}</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Selected Parking Breakdown -->
                <div class="item-list-box mb-4">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="mb-0 text-main font-heading">
                      <i class="fa-solid fa-car text-accent me-1"></i>
                      Venue Parking Bay
                    </h5>
                    <a [routerLink]="['/events', bookingState.currentEvent()?.id, 'parking']" class="btn btn-secondary btn-sm">
                      {{ bookingState.selectedParking() ? 'Change Bay' : 'Add Parking' }}
                    </a>
                  </div>

                  @if (bookingState.selectedParking()) {
                    <div class="d-flex justify-content-between align-items-center p-3 bg-surface rounded">
                      <div class="d-flex align-items-center gap-3">
                        <div class="parking-badge-lg">
                          {{ bookingState.selectedParking() | slotCode }}
                        </div>
                        <div>
                          <strong class="text-main d-block">Zone {{ bookingState.selectedParking()?.zone }}</strong>
                          <small class="text-dim">Allocated parking space near main entry</small>
                        </div>
                      </div>
                      <div class="text-end">
                        <span class="text-main font-bold">LKR {{ bookingState.parkingFee() | number }}</span>
                      </div>
                    </div>
                  } @else {
                    <div class="p-3 bg-surface rounded text-muted small d-flex justify-content-between align-items-center">
                      <span>No parking reserved for this booking.</span>
                      <a [routerLink]="['/events', bookingState.currentEvent()?.id, 'parking']" class="text-primary font-bold">
                        + Add parking bay
                      </a>
                    </div>
                  }
                </div>

                <!-- Lock seats button -->
                <div class="pt-3 border-top border-subtle d-flex justify-content-between align-items-center">
                  <a [routerLink]="['/events', bookingState.currentEvent()?.id, 'seats']" class="btn btn-secondary">
                    <i class="fa-solid fa-arrow-left me-1"></i> Modify Seats
                  </a>

                  <button
                    class="btn btn-primary btn-lg"
                    [disabled]="submitting() || bookingState.seatsCount() === 0"
                    (click)="createHoldAndProceed()">
                    @if (submitting()) {
                      <i class="fa-solid fa-circle-notch fa-spin"></i> Locking Seats...
                    } @else {
                      Proceed to Payment <i class="fa-solid fa-arrow-right ms-1"></i>
                    }
                  </button>
                </div>
              </div>
            } @else {
              <!-- STEP 2: SIMULATED PAYMENT FORM -->
              <div class="card p-4 mb-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h3 class="mb-0 d-flex align-items-center gap-2 section-title-sm">
                    <i class="fa-solid fa-credit-card text-primary"></i>
                    Payment Simulation
                  </h3>
                  <button type="button" class="btn btn-secondary btn-sm" (click)="autoFillTestCard()">
                    <i class="fa-solid fa-wand-magic-sparkles me-1 text-accent"></i> Auto-fill Test Card
                  </button>
                </div>

                <div class="alert-info-box p-3 mb-4 d-flex gap-3 align-items-center">
                  <i class="fa-solid fa-circle-info text-primary fs-4"></i>
                  <div class="small">
                    <strong class="text-main d-block">Sandbox Simulation Mode</strong>
                    <span>No actual charges are made. Enter any valid test card to confirm your booking and receive an official receipt.</span>
                  </div>
                </div>

                <form [formGroup]="paymentForm" (ngSubmit)="processPayment()">
                  <div class="form-group mb-3">
                    <label class="form-label" for="cardholderName">Cardholder Full Name</label>
                    <input
                      id="cardholderName"
                      type="text"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('cardholderName')"
                      formControlName="cardholderName"
                      placeholder="e.g. John Doe" />
                    @if (isFieldInvalid('cardholderName')) {
                      <div class="form-error">Cardholder name is required.</div>
                    }
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label" for="cardNumber">Card Number (16 Digits)</label>
                    <div class="input-with-icon">
                      <i class="fa-solid fa-credit-card input-icon"></i>
                      <input
                        id="cardNumber"
                        type="text"
                        class="form-control ps-5"
                        [class.is-invalid]="isFieldInvalid('cardNumber')"
                        formControlName="cardNumber"
                        placeholder="4000 1234 5678 9010" />
                    </div>
                    @if (isFieldInvalid('cardNumber')) {
                      <div class="form-error">Please enter a valid 16-digit card number.</div>
                    }
                  </div>

                  <div class="row d-flex gap-3 mb-4">
                    <div class="flex-grow-1">
                      <label class="form-label" for="expiry">Expiry (MM/YY)</label>
                      <input
                        id="expiry"
                        type="text"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('expiry')"
                        formControlName="expiry"
                        placeholder="MM/YY" />
                      @if (isFieldInvalid('expiry')) {
                        <div class="form-error">Use MM/YY format.</div>
                      }
                    </div>

                    <div class="flex-grow-1">
                      <label class="form-label" for="cvv">CVV (3 Digits)</label>
                      <input
                        id="cvv"
                        type="password"
                        maxlength="4"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('cvv')"
                        formControlName="cvv"
                        placeholder="•••" />
                      @if (isFieldInvalid('cvv')) {
                        <div class="form-error">Valid CVV required.</div>
                      }
                    </div>
                  </div>

                  <div class="d-flex justify-content-between align-items-center pt-3 border-top border-subtle">
                    <button type="button" class="btn btn-secondary" (click)="openCancelHoldModal()">
                      Cancel Reservation
                    </button>

                    <button
                      type="submit"
                      class="btn btn-primary btn-lg"
                      [disabled]="paying() || paymentForm.invalid">
                      @if (paying()) {
                        <i class="fa-solid fa-circle-notch fa-spin"></i> Authorizing...
                      } @else {
                        <i class="fa-solid fa-lock me-1"></i> Pay LKR {{ bookingState.grandTotal() | number }}
                      }
                    </button>
                  </div>
                </form>
              </div>
            }
          </div>

          <!-- RIGHT: Sticky Order Total Sidebar -->
          <div class="order-sidebar-col">
            <div class="card p-4 sticky-sidebar">
              <h4 class="mb-3 sidebar-title">Order Summary</h4>

              <div class="d-flex flex-column gap-2 mb-3 pb-3 border-bottom border-subtle small">
                <div class="d-flex justify-content-between">
                  <span class="text-dim">Tickets ({{ bookingState.seatsCount() }})</span>
                  <span class="text-main font-bold">LKR {{ bookingState.seatsTotal() | number }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-dim">Parking Fee</span>
                  <span class="text-main font-bold">LKR {{ bookingState.parkingFee() | number }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-dim">Booking Service Fee</span>
                  <span class="text-primary font-bold">FREE (LKR 0)</span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mb-4">
                <span class="font-bold text-main fs-5">Total Due</span>
                <span class="font-bold text-primary fs-4">LKR {{ bookingState.grandTotal() | number }}</span>
              </div>

              <div class="guarantee-box p-3 rounded mb-3 bg-surface small text-muted">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="fa-solid fa-shield-halved text-primary"></i>
                  <span>100% Concurrency Safe</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-file-invoice text-accent"></i>
                  <span>Instant Tax Receipt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CANCEL HOLD CONFIRMATION DIALOG -->
    <app-confirmation-dialog
      [isOpen]="showCancelModal"
      [title]="'Cancel Reservation Hold?'"
      [message]="'If you cancel, your locked seats and parking bay will be released for other customers immediately.'"
      [confirmText]="'Yes, Release Seats'"
      [cancelText]="'Keep Reservation'"
      [isDanger]="true"
      (confirm)="cancelHold()"
      (cancel)="showCancelModal = false">
    </app-confirmation-dialog>
  `,
  styles: [`
    .checkout-steps {
      max-width: 500px;
    }
    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
    }
    .step-indicator.active {
      opacity: 1;
      color: var(--text-main);
    }
    .step-indicator.completed {
      opacity: 1;
      color: var(--primary);
    }
    .step-num {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--bg-surface);
      border: 2px solid var(--border-medium);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: var(--text-main);
    }
    .step-indicator.active .step-num {
      border-color: var(--primary);
      background: var(--primary);
      color: var(--text-on-primary);
    }
    .step-indicator.completed .step-num {
      border-color: var(--primary);
      background: var(--accent);
      color: var(--text-on-primary);
    }
    .step-line {
      height: 2px;
      width: 60px;
      background: var(--border-subtle);
    }
    .step-line.filled {
      background: var(--primary);
    }
    .hold-timer-banner {
      background: var(--accent-subtle);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
    }
    .timer-icon-bubble {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent-subtle);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .countdown-clock {
      padding: 0.4rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.3rem;
      color: var(--accent);
      letter-spacing: 1.5px;
    }
    .countdown-clock.urgent {
      color: var(--danger);
      animation: pulseGlow 1s infinite;
    }
    .reservation-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      font-family: var(--font-body);
    }
    @media (max-width: 992px) {
      .reservation-grid { grid-template-columns: 1fr; }
    }
    .section-title-sm {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .event-snapshot-card {
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .event-mini-thumb {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .item-list-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }
    .table-sm-custom th {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-dim);
      padding: 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .table-sm-custom td {
      padding: 0.6rem 0.5rem;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.885rem;
    }
    .parking-badge-lg {
      padding: 0.4rem 0.8rem;
      background: var(--accent-subtle);
      border: 1px solid rgba(181, 154, 91, 0.4);
      border-radius: var(--radius-sm);
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1rem;
      color: var(--accent);
    }
    .sticky-sidebar {
      position: sticky;
      top: 90px;
      border: 1px solid var(--border-medium);
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .sidebar-title {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .alert-info-box {
      background: var(--primary-subtle);
      border: 1px solid rgba(41, 73, 54, 0.25);
      border-radius: var(--radius-md);
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-dim);
      pointer-events: none;
    }
  `]
})
export class BookingSummaryComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  bookingState = inject(BookingStateService);
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  step = signal<number>(1);
  submitting = signal<boolean>(false);
  paying = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  holdActive = signal<boolean>(false);
  activeHold = signal<{ bookingId: number; bookingNumber: string; holdExpiresAt: string } | null>(null);
  remainingSeconds = signal<number>(900);
  private timerInterval: any = null;

  showCancelModal: boolean = false;

  paymentForm: FormGroup = this.fb.group({
    cardholderName: ['', [Validators.required, Validators.minLength(3)]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{16,19}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
  });

  ngOnInit(): void {
    if (!this.bookingState.hasSelection() && !this.bookingState.activeHold()) {
      this.toastService.warning('Please select seats first.');
      this.router.navigate(['/events']);
      return;
    }

    const currentHold = this.bookingState.activeHold();
    if (currentHold) {
      this.activeHold.set(currentHold);
      this.holdActive.set(true);
      this.step.set(2);
      this.startCountdown(currentHold.holdExpiresAt);
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  isFieldInvalid(name: string): boolean {
    const c = this.paymentForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  autoFillTestCard(): void {
    this.paymentForm.patchValue({
      cardholderName: 'Test Customer',
      cardNumber: '4000 1234 5678 9010',
      expiry: '08/29',
      cvv: '888'
    });
    this.toastService.info('Test card numbers inserted.');
  }

  createHoldAndProceed(): void {
    const seatIds = this.bookingState.selectedSeats().map(s => s.id);
    const parkingSlotId = this.bookingState.selectedParking()?.id || null;

    if (seatIds.length === 0) {
      this.toastService.warning('A booking requires at least one seat.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.bookingService.createBooking({ seatIds, parkingSlotId }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        const holdData = {
          bookingId: res.bookingId,
          bookingNumber: res.bookingNumber,
          holdExpiresAt: res.holdExpiresAt
        };
        this.activeHold.set(holdData);
        this.bookingState.setActiveHold(holdData);
        this.holdActive.set(true);
        this.step.set(2);
        this.startCountdown(res.holdExpiresAt);
        this.toastService.success('Seats locked! Please complete payment within 15 minutes.');
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.message || 'Failed to lock seats. One or more seats may have been booked.';
        this.errorMessage.set(msg);
        this.toastService.error(msg);
      }
    });
  }

  processPayment(): void {
    if (this.paymentForm.invalid || !this.activeHold()) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.paying.set(true);
    this.errorMessage.set(null);

    const bookingId = this.activeHold()!.bookingId;

    this.paymentService.processPayment(bookingId).subscribe({
      next: (res) => {
        this.paying.set(false);
        this.stopCountdown();
        this.toastService.success('Payment completed successfully!', 'Confirmed');

        const bookingNumber = this.activeHold()!.bookingNumber;
        const total = this.bookingState.grandTotal();
        const eventTitle = this.bookingState.currentEvent()?.title || 'Event Booking';

        this.bookingState.clearAll();

        this.router.navigate(['/reservations/success'], {
          queryParams: {
            bookingId,
            receiptNumber: res.receiptNumber,
            bookingNumber,
            total,
            eventTitle
          }
        });
      },
      error: (err) => {
        this.paying.set(false);
        const msg = err.error?.message || 'Payment processing failed. Please check your details.';
        this.errorMessage.set(msg);
      }
    });
  }

  openCancelHoldModal(): void {
    this.showCancelModal = true;
  }

  cancelHold(): void {
    this.showCancelModal = false;
    const hold = this.activeHold();
    if (!hold) return;

    this.bookingService.cancelBooking(hold.bookingId).subscribe({
      next: () => {
        this.stopCountdown();
        this.holdActive.set(false);
        this.activeHold.set(null);
        this.bookingState.setActiveHold(null);
        this.step.set(1);
        this.toastService.info('Booking hold released. Seats are available again.');
      },
      error: () => {
        this.toastService.error('Failed to cancel hold.');
      }
    });
  }

  private startCountdown(expiresAtUtcStr: string): void {
    this.stopCountdown();

    const expiresAt = new Date(expiresAtUtcStr).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((expiresAt - now) / 1000));
      this.remainingSeconds.set(diffSec);

      if (diffSec <= 0) {
        this.stopCountdown();
        this.toastService.error('15-minute hold expired. Please select seats again.', 'Hold Expired');
        this.bookingState.clearAll();
        this.router.navigate(['/events']);
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  private stopCountdown(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formattedRemainingTime(): string {
    const totalSec = this.remainingSeconds();
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

export const MakeReservationComponent = BookingSummaryComponent;
export type MakeReservationComponent = BookingSummaryComponent;
