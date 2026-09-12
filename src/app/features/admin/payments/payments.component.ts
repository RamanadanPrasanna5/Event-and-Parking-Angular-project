import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentHistoryDto, ReceiptDto } from '../../../core/models/payment.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-admin-payments, app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ErrorBannerComponent
  ],
  template: `
    <div class="admin-payments-container">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Financial Records</span>
          <h1 class="page-title mb-1">Payment Transactions</h1>
          <p class="text-muted mb-0">Audit customer transactions, simulate settlements, and view payment receipts</p>
        </div>

        <button class="btn btn-secondary" (click)="loadPayments()">
          <i class="fa-solid fa-arrows-rotate me-1" [class.fa-spin]="loading()"></i> Refresh Records
        </button>
      </div>

      <!-- Financial Metrics Grid -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="metric-card">
            <span class="metric-label">Total Transactions</span>
            <span class="metric-val">{{ payments().length }}</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card">
            <span class="metric-label">Settled Revenue</span>
            <span class="metric-val text-success">\${{ totalSettledRevenue() | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card">
            <span class="metric-label">Average Transaction</span>
            <span class="metric-val text-primary">\${{ averageTransaction() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Search Control -->
      <div class="card p-3 mb-4">
        <div class="row g-3">
          <div class="col-md-8">
            <input
              type="text"
              class="form-control"
              [(ngModel)]="searchQuery"
              placeholder="Search by Payment ID, Booking ID, or Receipt Number..."
            />
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Auditing financial ledgers..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadPayments()"></app-error-banner>
      } @else if (filteredPayments().length === 0) {
        <div class="card p-5 text-center">
          <i class="fa-solid fa-receipt fa-3x text-muted mb-3"></i>
          <h4>No Payments Recorded</h4>
          <p class="text-muted">There are no payment entries matching your query.</p>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Booking Reference</th>
                  <th>Receipt Number</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th class="text-end">Receipt</th>
                </tr>
              </thead>
              <tbody>
                @for (p of filteredPayments(); track p.paymentId) {
                  <tr>
                    <td>
                      <span class="font-monospace fw-bold">#TX-{{ p.paymentId }}</span>
                    </td>
                    <td>
                      <span class="badge bg-secondary-subtle text-dark border">
                        Booking #{{ p.bookingId }}
                      </span>
                    </td>
                    <td>
                      <span class="font-monospace text-muted">{{ p.receiptNumber || 'N/A' }}</span>
                    </td>
                    <td>
                      <strong class="text-success fs-6">\${{ p.amount | number:'1.2-2' }}</strong>
                    </td>
                    <td class="text-muted small">
                      {{ p.paymentDate | date:'medium' }}
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-secondary" (click)="viewReceipt(p.paymentId)">
                        <i class="fa-solid fa-file-invoice me-1"></i> View Receipt
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- RECEIPT MODAL -->
      @if (activeReceipt()) {
        <div class="modal-overlay" (click)="closeReceipt()">
          <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 500px;">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h3 class="modal-title mb-0">Payment Receipt</h3>
              <button class="btn btn-sm btn-icon" (click)="closeReceipt()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="p-3 bg-light rounded text-center mb-3">
              <div class="text-success fs-1 mb-2"><i class="fa-solid fa-circle-check"></i></div>
              <h4 class="mb-1">Payment Completed</h4>
              <p class="text-muted small mb-0">Receipt: {{ activeReceipt()?.receiptNumber }}</p>
            </div>

            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Event</span>
              <span class="fw-bold">{{ activeReceipt()?.eventName }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Customer</span>
              <span>{{ activeReceipt()?.customerEmail }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Booking Reference</span>
              <span>{{ activeReceipt()?.bookingReference }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Payment Date</span>
              <span>{{ activeReceipt()?.paymentDate | date:'medium' }}</span>
            </div>
            <div class="d-flex justify-content-between py-3">
              <span class="fw-bold fs-5">Total Paid</span>
              <span class="fw-bold fs-5 text-success">\${{ (activeReceipt()?.totalAmountPaid || 0) | number:'1.2-2' }}</span>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button class="btn btn-primary" (click)="closeReceipt()">Close</button>
            </div>
          </div>
        </div>
      }
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
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }
    .modal-content {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-xl);
      padding: 2rem;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }
  `]
})
export class PaymentsComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);

  payments = signal<PaymentHistoryDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchQuery = '';

  activeReceipt = signal<ReceiptDto | null>(null);

  totalSettledRevenue = computed(() =>
    this.payments().reduce((sum, p) => sum + (p.amount || 0), 0)
  );

  averageTransaction = computed(() => {
    const list = this.payments();
    return list.length ? this.totalSettledRevenue() / list.length : 0;
  });

  filteredPayments = computed(() => {
    let list = this.payments();
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(p =>
        p.paymentId.toString().includes(q) ||
        p.bookingId.toString().includes(q) ||
        (p.receiptNumber && p.receiptNumber.toLowerCase().includes(q))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.paymentService.getCustomerPayments().subscribe({
      next: (data) => {
        this.payments.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load payments history.');
        this.loading.set(false);
      }
    });
  }

  viewReceipt(paymentId: number): void {
    this.paymentService.getReceipt(paymentId).subscribe({
      next: (receipt) => {
        this.activeReceipt.set(receipt);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Receipt could not be loaded.');
      }
    });
  }

  closeReceipt(): void {
    this.activeReceipt.set(null);
  }
}

export { PaymentsComponent as AdminPaymentsComponent };
