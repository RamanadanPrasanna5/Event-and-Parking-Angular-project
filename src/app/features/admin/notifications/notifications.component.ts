import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerNotificationItem, NotificationDto } from '../../../core/models/notification.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-admin-notifications, app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ErrorBannerComponent
  ],
  template: `
    <div class="admin-notifications-container">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Communications</span>
          <h1 class="page-title mb-1">System Notifications</h1>
          <p class="text-muted mb-0">Audit outbound user notifications, event bulletins, and booking alerts</p>
        </div>

        <button class="btn btn-secondary" (click)="loadNotifications()">
          <i class="fa-solid fa-arrows-rotate me-1" [class.fa-spin]="loading()"></i> Refresh Alerts
        </button>
      </div>

      <!-- Quick Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="metric-card">
            <span class="metric-label">Total Notifications</span>
            <span class="metric-val">{{ notifications().length }}</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card">
            <span class="metric-label">Unread Deliveries</span>
            <span class="metric-val text-warning">{{ unreadCount() }}</span>
          </div>
        </div>
        <div class="col-md-4">
          <div class="metric-card">
            <span class="metric-label">Read / Acknowledged</span>
            <span class="metric-val text-success">{{ readCount() }}</span>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card p-3 mb-4">
        <div class="row g-3">
          <div class="col-md-8">
            <input
              type="text"
              class="form-control"
              [(ngModel)]="searchQuery"
              placeholder="Search notifications by message content..."
            />
          </div>
          <div class="col-md-4">
            <select class="form-control" [(ngModel)]="statusFilter">
              <option value="ALL">All States</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Acknowledged Only</option>
            </select>
          </div>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading system communications..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadNotifications()"></app-error-banner>
      } @else if (filteredNotifications().length === 0) {
        <div class="card p-5 text-center">
          <i class="fa-solid fa-bell-slash fa-3x text-muted mb-3"></i>
          <h4>No Notifications Found</h4>
          <p class="text-muted">There are no notifications matching the selected filter.</p>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Message</th>
                  <th>Customer ID</th>
                  <th>Delivery Date</th>
                  <th class="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (n of filteredNotifications(); track n.id) {
                  <tr>
                    <td>
                      @if (!n.isRead) {
                        <span class="badge badge-warning">
                          <i class="fa-solid fa-circle-dot me-1"></i> New
                        </span>
                      } @else {
                        <span class="badge badge-success">
                          <i class="fa-solid fa-check me-1"></i> Read
                        </span>
                      }
                    </td>
                    <td>
                      <p class="mb-0 fw-medium">{{ n.message }}</p>
                    </td>
                    <td>
                      <span class="badge bg-secondary-subtle text-dark border">
                        #User-{{ n.customerId }}
                      </span>
                    </td>
                    <td class="text-muted small">
                      {{ n.createdAt | date:'medium' }}
                    </td>
                    <td class="text-end">
                      @if (!n.isRead) {
                        <button class="btn btn-sm btn-secondary" (click)="markAsRead(n.id)">
                          <i class="fa-solid fa-check me-1"></i> Mark Read
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
  `]
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  notifications = signal<CustomerNotificationItem[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchQuery = '';
  statusFilter = 'ALL';

  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
  readCount = computed(() => this.notifications().filter(n => n.isRead).length);

  filteredNotifications = computed(() => {
    let list = this.notifications();
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(n =>
        n.message.toLowerCase().includes(q) ||
        (n.customerId ? n.customerId.toString().includes(q) : false)
      );
    }

    if (this.statusFilter === 'UNREAD') {
      list = list.filter(n => !n.isRead);
    } else if (this.statusFilter === 'READ') {
      list = list.filter(n => n.isRead);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const user = this.authService.currentUser();
    const customerId = user?.id || 1;

    this.loading.set(true);
    this.error.set(null);

    this.notificationService.getNotifications(customerId).subscribe({
      next: (data) => {
        this.notifications.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load notifications.');
        this.loading.set(false);
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(items =>
          items.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        this.toastService.success('Notification marked as read.');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Action failed.');
      }
    });
  }
}

export { NotificationsComponent as AdminNotificationsComponent };
