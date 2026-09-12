import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../core/services/payment.service';
import { PaymentHistoryDto } from '../../../core/models/payment.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <div class="page-wrapper">
      <div class="container">
        <div class="mb-4">
          <span class="badge badge-primary mb-2">Ledger</span>
          <h1 class="page-title text-main mb-1">Payment History</h1>
          <p class="text-muted">Review all completed transactions and official receipts</p>
        </div>

        <div class="card p-4">
          @if (loading()) {
            <app-loading message="Loading payment records..."></app-loading>
          } @else if (payments().length === 0) {
            <div class="text-center py-5 text-muted">
              <i class="fa-solid fa-receipt fs-2 mb-3 text-dim"></i>
              <p>No payment records found.</p>
            </div>
          } @else {
            <div class="table-responsive">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Receipt #</th>
                    <th>Booking ID</th>
                    <th>Amount Paid</th>
                    <th>Transaction Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pay of payments(); track pay.paymentId) {
                    <tr>
                      <td>#{{ pay.paymentId }}</td>
                      <td><strong class="font-mono text-main">{{ pay.receiptNumber }}</strong></td>
                      <td>#{{ pay.bookingId }}</td>
                      <td><strong class="text-success">LKR {{ pay.amount | number }}</strong></td>
                      <td><small class="text-muted">{{ pay.paymentDate | date:'medium' }}</small></td>
                      <td><span class="badge badge-success">Completed</span></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); }
    .font-mono { font-family: monospace; }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  private paymentService = inject(PaymentService);

  payments = signal<PaymentHistoryDto[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.paymentService.getCustomerPayments().subscribe({
      next: (data) => {
        this.payments.set(data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
