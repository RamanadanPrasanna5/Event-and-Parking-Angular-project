import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDto } from '../../../core/models/notification.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <div class="page-wrapper">
      <div class="container container-sm">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <span class="badge badge-primary mb-2">Inbox</span>
            <h1 class="page-title text-white mb-0">Notifications</h1>
          </div>
          <button class="btn btn-outline btn-sm" (click)="loadNotifications()">
            <i class="fa-solid fa-rotate-right me-1"></i> Refresh
          </button>
        </div>

        <div class="card p-4">
          @if (loading()) {
            <app-loading message="Loading your notifications..."></app-loading>
          } @else if (notifications().length === 0) {
            <div class="text-center py-5 text-muted">
              <i class="fa-regular fa-bell-slash fs-2 mb-3 text-dim"></i>
              <p>No notifications yet.</p>
            </div>
          } @else {
            <div class="d-flex flex-column gap-2">
              @for (notif of notifications(); track notif.id) {
                <div
                  class="notification-item p-3 rounded d-flex justify-content-between align-items-center"
                  [class.unread]="!notif.isRead">
                  <div class="d-flex align-items-center gap-3">
                    <span class="notif-dot" [class.unread-dot]="!notif.isRead"></span>
                    <div>
                      <div class="text-white font-500">{{ notif.message }}</div>
                      <small class="text-dim">{{ notif.createdAt | date:'medium' }}</small>
                    </div>
                  </div>
                  @if (!notif.isRead) {
                    <button
                      class="btn btn-sm btn-outline py-0 px-2"
                      (click)="markNotificationRead(notif.id)">
                      Mark as Read
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; }
    .notification-item {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-fast);
    }
    .notification-item.unread {
      border-left: 4px solid var(--primary);
      background: rgba(99, 102, 241, 0.05);
    }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-medium); }
    .notif-dot.unread-dot { background: var(--primary); box-shadow: 0 0 8px var(--primary-glow); }
    .font-500 { font-weight: 500; }
  `]
})
export class NotificationsComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  notifications = signal<NotificationDto[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const id = this.authService.getCustomerId();
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.notificationService.getNotifications(id).subscribe({
      next: (items) => {
        this.notifications.set(items || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markNotificationRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    });
  }
}
