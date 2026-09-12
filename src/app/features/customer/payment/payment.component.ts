import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerBookingDto } from '../../../core/models/booking.model';
import { AuthService } from '../../../core/services/auth.service';
import { BookingProgressComponent } from '../../../shared/components/booking-progress/booking-progress.component';
import { HoldTimerComponent } from '../../../shared/components/hold-timer/hold-timer.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BookingProgressComponent, HoldTimerComponent],
  template: `
    <div class="page-wrapper position-relative">
      <div class="container container-sm">
        <!-- Progress Indicator -->
        <app-booking-progress currentStep="payment"></app-booking-progress>

        <div class="text-center mb-4">
          <h1 class="page-title mb-1 text-main">Payment Checkout</h1>
          <p class="text-muted">Enter your payment card details to confirm your reservation</p>
        </div>

        <!-- HOLD TIMER COUNTDOWN -->
        @if (holdExpiresAt()) {
          <app-hold-timer
            [holdExpiresAt]="holdExpiresAt()"
            [totalSeconds]="900"
            [parkingSelected]="!!bookingState.selectedParking()"
            (expired)="onHoldExpired()">
          </app-hold-timer>
        }

        <!-- HOLD EXPIRED MODAL -->
        @if (holdExpired()) {
          <div class="hold-expired-overlay d-flex align-items-center justify-content-center">
            <div class="hold-expired-card text-center p-5">
              <div class="expired-icon mx-auto mb-3">
                <i class="fa-regular fa-clock-rotate-left"></i>
              </div>
              <h3 class="text-main mb-2">Hold Expired</h3>
              <p class="text-muted mb-4">
                Your 15-minute seat hold has expired. The seats have been released back to the pool.
                Please start a fresh booking.
              </p>
              <button class="btn btn-primary" (click)="redirectToEvents()">
                <i class="fa-solid fa-arrow-left me-1"></i> Back to Events
              </button>
            </div>
          </div>
        }

        <!-- SECURE PAYMENT BADGE -->
        <div class="alert-secure p-3 mb-4 rounded d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-2">
            <i class="fa-solid fa-shield-halved text-success fs-5"></i>
            <small class="text-main">
              <strong>Bank-Grade 256-Bit Encrypted Payment</strong> &bull; Secure TLS checkout
            </small>
          </div>
          <button type="button" class="btn btn-sm btn-secondary py-1 px-2 text-xs" (click)="autoFillTestCard()">
            <i class="fa-solid fa-credit-card text-primary me-1"></i> Fill Test Card
          </button>
        </div>

        <!-- BOOKING DETAILS OVERVIEW CARD -->
        <div class="card p-4 mb-4">
          <h4 class="text-main mb-3 d-flex align-items-center justify-content-between">
            <span>Booking Details</span>
            <span class="badge badge-primary font-mono">{{ booking?.bookingNumber || 'BK-' + bookingId }}</span>
          </h4>

          <div class="d-flex flex-column gap-2 text-sm pb-3 border-bottom border-subtle">
            <div class="d-flex justify-content-between">
              <span class="text-muted">Event</span>
              <strong class="text-main">{{ booking?.eventName || bookingState.currentEvent()?.title || 'Selected Event' }}</strong>
            </div>

            <div class="d-flex justify-content-between">
              <span class="text-muted">Seats</span>
              <span class="text-main font-bold">{{ formatSeats(booking?.seatNumbers) }}</span>
            </div>

            <div class="d-flex justify-content-between">
              <span class="text-muted">Parking</span>
              <span class="text-main">{{ booking?.parkingDetails || 'No parking selected' }}</span>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center pt-3">
            <span class="text-main font-bold fs-5">Total Amount</span>
            <strong class="total-pay-amount text-primary fs-3">
              LKR {{ (amountDue() || booking?.totalPrice || bookingState.grandTotal() || 0) | number }}
            </strong>
          </div>
        </div>

        <!-- PAYMENT FORM CARD -->
        <div class="card p-4 p-md-5 mb-4">
          <h4 class="text-main mb-4 d-flex align-items-center gap-2">
            <i class="fa-regular fa-credit-card text-primary"></i> Credit / Debit Card
          </h4>

          <form [formGroup]="paymentForm" (ngSubmit)="payNow()">
            <!-- Card Number -->
            <div class="form-group mb-3">
              <label class="form-label" for="cardNumber">Card Number</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-credit-card input-icon"></i>
                <input
                  id="cardNumber"
                  type="text"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('cardNumber')"
                  formControlName="cardNumber"
                  placeholder="4000 1234 5678 9010" />
              </div>
              @if (isFieldInvalid('cardNumber')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i> Valid 16-digit card number required.
                </div>
              }
            </div>

            <!-- Card Holder Name -->
            <div class="form-group mb-3">
              <label class="form-label" for="cardHolderName">Cardholder Name</label>
              <div class="input-with-icon">
                <i class="fa-regular fa-user input-icon"></i>
                <input
                  id="cardHolderName"
                  type="text"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('cardHolderName')"
                  formControlName="cardHolderName"
                  placeholder="e.g. John Perera" />
              </div>
              @if (isFieldInvalid('cardHolderName')) {
                <div class="form-error">
                  <i class="fa-solid fa-circle-exclamation"></i> Cardholder name is required.
                </div>
              }
            </div>

            <!-- Expiry & CVV Row -->
            <div class="row d-flex gap-3 mb-4">
              <div class="flex-grow-1">
                <label class="form-label" for="expiryDate">Expiration Date</label>
                <input
                  id="expiryDate"
                  type="text"
                  maxlength="5"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('expiryDate')"
                  formControlName="expiryDate"
                  placeholder="MM/YY" />
                @if (isFieldInvalid('expiryDate')) {
                  <div class="form-error">Use MM/YY</div>
                }
              </div>

              <div class="flex-grow-1">
                <label class="form-label" for="cvv">CVV</label>
                <input
                  id="cvv"
                  type="password"
                  maxlength="4"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('cvv')"
                  formControlName="cvv"
                  placeholder="•••" />
                @if (isFieldInvalid('cvv')) {
                  <div class="form-error">Valid 3-4 digit CVV required</div>
                }
              </div>
            </div>

            <!-- [ Pay Now ] Button -->
            <button
              type="submit"
              class="btn btn-primary btn-lg w-100 py-3 font-bold"
              [disabled]="processing() || paymentForm.invalid">
              @if (processing()) {
                <i class="fa-solid fa-circle-notch fa-spin me-2"></i> Authorizing Payment...
              } @else {
                <i class="fa-solid fa-lock me-2"></i> Pay Now (LKR {{ (amountDue() || booking?.totalPrice || bookingState.grandTotal() || 0) | number }})
              }
            </button>
          </form>
        </div>
      </div>

      <!-- PROCESSING ANIMATION OVERLAY -->
      @if (processing()) {
        <div class="processing-overlay d-flex flex-column align-items-center justify-content-center">
          <div class="processing-spinner-box text-center p-4 rounded">
            <div class="spinner-border text-primary mb-3" style="width: 3.5rem; height: 3.5rem;" role="status"></div>
            <h3 class="text-main mb-2">Processing Payment...</h3>
            <p class="text-muted small mb-0">Connecting to secure gateway. Please do not close or refresh the window.</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); }
    .alert-secure {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
    }
    .total-pay-amount {
      font-family: var(--font-heading);
      font-weight: 800;
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      pointer-events: none;
    }
    .input-with-icon input {
      padding-left: 2.75rem;
    }
    .font-mono { font-family: monospace; }
    .processing-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      z-index: 2000;
    }
    .processing-spinner-box {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      max-width: 400px;
      box-shadow: var(--shadow-lg);
    }
    .spinner-border {
      border-width: 0.3em;
      border-color: var(--primary);
      border-right-color: transparent;
      border-radius: 50%;
      animation: spinner-border .75s linear infinite;
    }
    @keyframes spinner-border {
      to { transform: rotate(360deg); }
    }
    /* Hold Expired Overlay */
    .hold-expired-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(10px);
      z-index: 3000;
    }
    .hold-expired-card {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      max-width: 440px;
      width: 90%;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-subtle);
    }
    .expired-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: #FEE2E2;
      color: #DC2626;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }
  `]
})
export class PaymentComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  bookingState = inject(BookingStateService);
  private toastService = inject(ToastService);

  bookingId: number = 0;
  booking: CustomerBookingDto | null = null;
  amountDue = signal<number>(0);
  processing = signal<boolean>(false);
  holdExpired = signal<boolean>(false);

  /** ISO string expiry pulled from BookingStateService */
  readonly holdExpiresAt = () => {
    const h = this.bookingState.activeHold();
    return h ? h.holdExpiresAt : null;
  };

  paymentForm: FormGroup = this.fb.group({
    cardNumber: ['4000 1234 5678 9010', [Validators.required, Validators.pattern(/^[0-9 ]{16,19}$/)]],
    cardHolderName: ['Test Customer', [Validators.required, Validators.minLength(3)]],
    expiryDate: ['08/29', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
    cvv: ['888', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('bookingId');
    if (idParam) {
      this.bookingId = parseInt(idParam, 10);
    }
    if (!this.bookingId || isNaN(this.bookingId)) {
      this.bookingId = this.bookingState.activeHold()?.bookingId || 101;
    }

    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please log in to complete your payment.', 'Sign In Required');
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/payment/${this.bookingId}` } });
      return;
    }

    if (this.bookingState.grandTotal() > 0) {
      this.amountDue.set(this.bookingState.grandTotal());
    }

    if (this.bookingId > 0) {
      this.paymentService.getPaymentStatus(this.bookingId).subscribe({
        next: (status) => {
          if (status.amountDue) {
            this.amountDue.set(status.amountDue);
          }
          if (status.isPaid) {
            this.toastService.info('This booking is already paid.');
            this.router.navigate(['/payment-success', this.bookingId]);
          }
        },
        error: () => {}
      });

      this.bookingService.getBookingById(this.bookingId).subscribe({
        next: (b) => {
          this.booking = b;
          if (b && (!this.amountDue() || this.amountDue() === 0)) {
            this.amountDue.set(b.totalPrice);
          }
        },
        error: () => {}
      });
    }
  }

  ngOnDestroy(): void {
    // cleanup handled by HoldTimerComponent itself
  }

  onHoldExpired(): void {
    if (this.processing()) return; // already paying, don't interrupt
    this.holdExpired.set(true);
    this.toastService.error('Your 15-minute seat hold has expired. Please re-select your seats.', 'Hold Expired');
    this.bookingState.clearAll();
  }

  redirectToEvents(): void {
    this.router.navigate(['/events']);
  }

  isFieldInvalid(name: string): boolean {
    const c = this.paymentForm.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  autoFillTestCard(): void {
    this.paymentForm.patchValue({
      cardNumber: '4000 1234 5678 9010',
      cardHolderName: 'Test Customer',
      expiryDate: '08/29',
      cvv: '888'
    });
    this.toastService.info('Test payment card filled.');
  }

  formatSeats(seatNumbers?: string[]): string {
    if (!seatNumbers || seatNumbers.length === 0) {
      const stateSeats = this.bookingState.selectedSeats().map(s => `${s.row}${s.seatNumber}`);
      return stateSeats.length > 0 ? stateSeats.join(', ') : 'None';
    }
    return seatNumbers.join(', ');
  }

  payNow(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.processing.set(true);

    this.paymentService.processPayment(this.bookingId).subscribe({
      next: () => {
        this.processing.set(false);
        this.bookingState.clearAll();
        this.toastService.success('Payment completed successfully!', 'Paid');
        this.router.navigate(['/payment-success', this.bookingId]);
      },
      error: (err) => {
        this.processing.set(false);
        this.toastService.error(err.error?.message || 'Payment processing failed. Please verify and try again.');
      }
    });
  }
}

export const PaymentCheckoutComponent = PaymentComponent;
export type PaymentCheckoutComponent = PaymentComponent;
