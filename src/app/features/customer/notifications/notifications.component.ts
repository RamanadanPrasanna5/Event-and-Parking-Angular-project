import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerNotificationItem } from '../../../core/models/notification.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <div class="page-wrapper">
      <div class="container container-sm">
        <!-- Header & Mark All as Read Button -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span class="badge badge-primary mb-2">Notification Center</span>
            <h1 class="page-title text-main mb-0">Notifications</h1>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-secondary btn-sm" (click)="markAllAsRead()">
              <i class="fa-solid fa-check-double me-1"></i> Mark All as Read
            </button>
          </div>
        </div>

        <div class="card p-3 p-md-4">
          @if (loading()) {
            <app-loading message="Loading notifications..."></app-loading>
          } @else if (notifications().length === 0) {
            <div class="text-center py-5 text-muted">
              <i class="fa-regular fa-bell-slash fs-1 mb-3 text-muted"></i>
              <h4 class="text-main mb-1">No Notifications</h4>
              <p class="mb-0">You're all caught up with your bookings and payments.</p>
            </div>
          } @else {
            <div class="d-flex flex-column gap-3">
              @for (notif of notifications(); track notif.id) {
                <div
                  class="notification-card p-3 rounded d-flex justify-content-between align-items-center"
                  [class.unread-card]="!notif.isRead"
                  (click)="onNotificationClick(notif)">
                  <div class="d-flex align-items-start gap-3">
                    <div class="notif-icon-box">
                      <i [class]="notif.icon"></i>
                    </div>

                    <div>
                      <div class="d-flex align-items-center gap-2 mb-1">
                        <strong class="text-main notif-title">{{ notif.title }}</strong>
                        @if (!notif.isRead) {
                          <span class="badge badge-primary py-0 px-2 text-xs">New</span>
                        }
                      </div>

                      <p class="text-muted small mb-1">{{ notif.message }}</p>
                      <small class="text-muted">{{ notif.createdAt | date:'medium' }}</small>
                    </div>
                  </div>

                  <!-- Actions: [ Mark as Read ] and arrow -->
                  <div class="d-flex align-items-center gap-2 ms-3" (click)="$event.stopPropagation()">
                    @if (!notif.isRead) {
                      <button
                        type="button"
                        class="btn btn-sm btn-secondary py-1 px-2 text-xs"
                        (click)="markAsRead(notif.id)">
                        Mark as Read
                      </button>
                    }
                    <i class="fa-solid fa-chevron-right text-muted fs-6 ms-1"></i>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 1.875rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }
    .notification-card {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .notification-card:hover {
      background: var(--bg-surface-alt);
      border-color: var(--border-medium);
    }
    .notification-card.unread-card {
      border-left: 3px solid var(--primary);
      background: var(--primary-light);
    }
    .notification-card.unread-card:hover { background: #E0FAF7; }
    .notif-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .notif-title { font-size: 0.9rem; font-weight: 600; }
    .text-xs { font-size: 0.7rem; }
  `]
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  notifications = signal<CustomerNotificationItem[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: items => {
        this.notifications.set(items || []);
        this.loading.set(false);
      },
      error: () => {
        this.notifications.set([]);
        this.loading.set(false);
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      },
      error: () => {}
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, isRead: true }))
        );
      },
      error: () => {}
    });
  }

  onNotificationClick(notif: CustomerNotificationItem): void {
    if (!notif.isRead) {
      this.markAsRead(notif.id);
    }
    // Navigate to related booking details
    if (notif.bookingId) {
      this.router.navigate(['/my-bookings', notif.bookingId]);
    }
  }
}
