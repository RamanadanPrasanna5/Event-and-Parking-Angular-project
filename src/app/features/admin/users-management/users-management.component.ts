import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerAdminView } from '../../../core/models/customer.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorBannerComponent, ConfirmationModalComponent],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Access Control</span>
          <h1 class="page-title mb-1">Customer Accounts</h1>
          <p class="text-muted mb-0">Search registered users, inspect account status, and manage active access</p>
        </div>

        <div class="d-flex gap-2" style="min-width: 280px;">
          <input
            type="text"
            class="form-control"
            [(ngModel)]="searchQuery"
            (keyup.enter)="loadCustomers()"
            placeholder="Search by name or email..." />
          <button class="btn btn-primary" (click)="loadCustomers()">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Querying customer directory..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadCustomers()"></app-error-banner>
      } @else if (customers().length === 0) {
        <div class="card p-5 text-center text-dim">
          <i class="fa-solid fa-user-slash mb-3" style="font-size: 2.5rem;"></i>
          <h4>No Customers Found</h4>
          <p>Try searching with another name or email address.</p>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Phone</th>
                  <th>Role</th>
                  <th>Email Verification</th>
                  <th>Account Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (u of customers(); track u.id) {
                  <tr>
                    <td>
                      <div class="font-bold text-white">{{ u.name || 'Unnamed' }}</div>
                      <small class="text-dim">{{ u.email }}</small>
                    </td>
                    <td>{{ u.phone || 'N/A' }}</td>
                    <td>
                      <span class="badge" [class.badge-primary]="u.role === 'Admin'" [class.badge-info]="u.role !== 'Admin'">
                        {{ u.role || 'Customer' }}
                      </span>
                    </td>
                    <td>
                      @if (u.emailVerified) {
                        <span class="badge badge-success"><i class="fa-solid fa-check me-1"></i> Verified</span>
                      } @else {
                        <span class="badge badge-warning"><i class="fa-solid fa-clock me-1"></i> Pending</span>
                      }
                    </td>
                    <td>
                      <span class="badge" [class.badge-success]="u.status === 'Active'" [class.badge-danger]="u.status !== 'Active'">
                        {{ u.status || 'Active' }}
                      </span>
                    </td>
                    <td class="text-end">
                      @if (u.status === 'Active') {
                        <button class="btn btn-sm btn-outline text-danger" (click)="promptToggleStatus(u, 'deactivate')">
                          <i class="fa-solid fa-user-xmark me-1"></i> Deactivate
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-success" (click)="promptToggleStatus(u, 'reactivate')">
                          <i class="fa-solid fa-user-check me-1"></i> Reactivate
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

      <!-- CONFIRMATION MODAL -->
      <app-confirmation-modal
        [isOpen]="showConfirmModal"
        [title]="actionType === 'deactivate' ? 'Deactivate Customer' : 'Reactivate Customer'"
        [message]="'Are you sure you want to ' + actionType + ' user ' + (targetUser?.email || '') + '?'"
        [confirmText]="actionType === 'deactivate' ? 'Deactivate' : 'Reactivate'"
        [isDanger]="actionType === 'deactivate'"
        [isLoading]="actionLoading()"
        (confirm)="executeAction()"
        (cancel)="showConfirmModal = false">
      </app-confirmation-modal>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2rem; font-weight: 800; }
  `]
})
export class UsersManagementComponent implements OnInit {
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);

  customers = signal<CustomerAdminView[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchQuery: string = '';

  showConfirmModal = false;
  targetUser: CustomerAdminView | null = null;
  actionType: 'deactivate' | 'reactivate' = 'deactivate';
  actionLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.customerService.searchCustomers(this.searchQuery || undefined).subscribe({
      next: (data) => {
        this.customers.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load customer list.');
      }
    });
  }

  promptToggleStatus(u: CustomerAdminView, action: 'deactivate' | 'reactivate'): void {
    this.targetUser = u;
    this.actionType = action;
    this.showConfirmModal = true;
  }

  executeAction(): void {
    if (!this.targetUser) return;
    this.actionLoading.set(true);

    const call$ = this.actionType === 'deactivate'
      ? this.customerService.deactivateCustomer(this.targetUser.id)
      : this.customerService.reactivateCustomer(this.targetUser.id);

    call$.subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.showConfirmModal = false;
        this.toastService.success(`Customer successfully ${this.actionType}d.`);
        this.loadCustomers();
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.toastService.error(err.error?.message || `Failed to ${this.actionType} customer.`);
      }
    });
  }
}
