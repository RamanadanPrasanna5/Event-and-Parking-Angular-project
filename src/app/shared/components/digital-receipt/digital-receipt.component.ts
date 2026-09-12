import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerBookingDto } from '../../../core/models/booking.model';

@Component({
  selector: 'app-digital-receipt',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="closeOnBackdrop($event)">
        <div class="receipt-modal-container card p-4 p-md-5">
          <!-- Close Button -->
          <button type="button" class="receipt-close-btn no-print" (click)="close()">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Receipt Header -->
          <div class="receipt-brand-header text-center mb-4 pb-3 border-bottom border-subtle">
            <div class="d-inline-flex align-items-center gap-2 mb-1">
              <div class="receipt-logo-icon">
                <i class="fa-solid fa-ticket"></i>
              </div>
              <span class="receipt-brand-title">EVENT & PARKING</span>
            </div>
            <p class="text-muted small mb-0">Official Digital Booking & Gate Admission Receipt</p>
          </div>

          <!-- Main Key Info Grid -->
          <div class="receipt-meta-grid mb-4 p-3 rounded">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small text-uppercase">Booking Number</span>
              <strong class="receipt-ref-code font-mono">{{ booking?.bookingNumber || 'BK-78901' }}</strong>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small text-uppercase">Customer Name</span>
              <span class="text-main font-bold">{{ booking?.customerName || 'Customer' }}</span>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted small text-uppercase">Payment Status</span>
              <span class="badge badge-success">
                <i class="fa-solid fa-circle-check me-1"></i> {{ booking?.paymentStatus || 'Paid' }}
              </span>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted small text-uppercase">Issued Date</span>
              <span class="text-muted small">{{ currentDate | date:'medium' }}</span>
            </div>
          </div>

          <!-- Event & Venue Details -->
          <div class="receipt-details-block mb-4">
            <h5 class="receipt-section-heading mb-2">Event Information</h5>
            <div class="p-3 bg-surface-alt border border-subtle rounded mb-3">
              <h4 class="text-main mb-1">{{ booking?.eventName }}</h4>
              <div class="text-primary small mb-1">
                <i class="fa-regular fa-calendar-check me-1"></i>
                {{ booking?.eventDate | date:'fullDate' }} &#64; {{ booking?.eventTime || '07:30 PM' }}
              </div>
              <div class="text-muted small">
                <i class="fa-solid fa-location-dot text-primary me-1"></i>
                {{ booking?.venue || 'Venue' }}
              </div>
            </div>

            <!-- Allocation: Seats & Parking -->
            <div class="row d-flex flex-wrap gap-2 mb-3">
              <div class="allocation-box flex-grow-1 p-3 bg-surface-alt border border-subtle rounded">
                <small class="text-muted text-uppercase d-block mb-1">
                  <i class="fa-solid fa-couch text-primary me-1"></i> Seats Allocated
                </small>
                <div class="d-flex flex-wrap gap-1">
                  @for (s of booking?.seatNumbers; track s) {
                    <span class="badge badge-primary">{{ s }}</span>
                  }
                  @if (!booking?.seatNumbers?.length) {
                    <span class="text-muted small">Standard Admission</span>
                  }
                </div>
              </div>

              <div class="allocation-box flex-grow-1 p-3 bg-surface-alt border border-subtle rounded">
                <small class="text-muted text-uppercase d-block mb-1">
                  <i class="fa-solid fa-square-parking text-primary me-1"></i> Parking Bay
                </small>
                <strong class="text-main">
                  {{ booking?.parkingDetails || booking?.parkingSlot || 'No Parking Reserved' }}
                </strong>
              </div>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="receipt-total-bar d-flex justify-content-between align-items-center p-3 mb-4 rounded">
            <span class="text-main font-bold">Payment Amount</span>
            <span class="total-paid-figure text-primary">LKR {{ (booking?.totalPrice || 0) | number }}</span>
          </div>

          <!-- Barcode Simulation for Gate Entry -->
          <div class="barcode-container text-center mb-4">
            <div class="barcode-lines mx-auto mb-1"></div>
            <small class="text-muted font-mono">Present barcode at venue gate & parking scanner</small>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-content-center gap-3 no-print">
            <button class="btn btn-secondary" (click)="close()">
              Close
            </button>
            <button class="btn btn-primary" (click)="downloadReceipt()">
              <i class="fa-solid fa-download me-1"></i> Download Receipt
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .receipt-modal-container {
      width: 100%;
      max-width: 580px;
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      max-height: 92vh;
      overflow-y: auto;
    }
    .receipt-close-btn {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .receipt-close-btn:hover {
      background: var(--primary-subtle);
      color: var(--primary);
    }
    .receipt-logo-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.9rem;
    }
    .receipt-brand-title {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 1px;
      color: var(--text-main);
    }
    .receipt-meta-grid {
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
    }
    .receipt-ref-code {
      color: var(--primary);
      font-size: 1.1rem;
    }
    .receipt-section-heading {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.75px;
      color: var(--text-muted);
    }
    .receipt-total-bar {
      background: var(--primary-subtle);
      border: 1px solid var(--primary);
    }
    .total-paid-figure {
      font-family: var(--font-heading);
      font-size: 1.5rem;
      font-weight: 800;
    }
    .barcode-lines {
      height: 42px;
      max-width: 280px;
      background: repeating-linear-gradient(
        90deg,
        #0F172A,
        #0F172A 2px,
        transparent 2px,
        transparent 5px,
        #0F172A 5px,
        #0F172A 8px,
        transparent 8px,
        transparent 10px
      );
      opacity: 0.9;
      border-radius: 2px;
    }
    .font-mono {
      font-family: monospace;
    }
    @media print {
      .modal-overlay {
        position: static;
        background: none;
      }
      .receipt-modal-container {
        border: 1px solid #000;
        color: #000;
        background: #fff;
        box-shadow: none;
      }
    }
  `]
})
export class DigitalReceiptComponent {
  @Input() isOpen: boolean = false;
  @Input() booking: CustomerBookingDto | null = null;
  @Output() closeReceipt = new EventEmitter<void>();

  currentDate = new Date();

  close(): void {
    this.closeReceipt.emit();
  }

  closeOnBackdrop(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.close();
    }
  }

  downloadReceipt(): void {
    window.print();
  }
}
