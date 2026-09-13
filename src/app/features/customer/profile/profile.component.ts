import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { CustomerProfileDto } from '../../../core/models/customer.model';
import { NotificationDto } from '../../../core/models/notification.model';
import { PaymentHistoryDto } from '../../../core/models/payment.model';
import { ThemeService } from '../../../core/services/theme.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-profile, app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  template: `
    <div class="page-wrapper">
      <div class="container py-4">
        <!-- Profile Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between mb-5 gap-3">
          <div class="d-flex align-items-center gap-3">
            <div class="profile-big-avatar">
              {{ (profile()?.name || authService.currentUser()?.email || 'U')[0].toUpperCase() }}
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h1 class="page-title mb-0">{{ profile()?.name || 'User Profile' }}</h1>
                <span class="badge badge-gold">{{ authService.currentUser()?.role }}</span>
              </div>
              <p class="text-muted mb-0">{{ profile()?.email || authService.currentUser()?.email }}</p>
            </div>
          </div>

          <button class="btn btn-secondary text-danger" (click)="authService.logout()">
            <i class="fa-solid fa-arrow-right-from-bracket me-1"></i> Sign Out
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="d-flex gap-2 mb-4 border-bottom border-subtle pb-2 flex-wrap">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'info'"
            (click)="activeTab.set('info')">
            <i class="fa-regular fa-id-card me-1"></i> Profile Information
          </button>

          <button
            class="tab-btn position-relative"
            [class.active]="activeTab() === 'notifications'"
            (click)="activeTab.set('notifications')">
            <i class="fa-regular fa-bell me-1"></i> Notifications
            @if (notificationService.unreadCount() > 0) {
              <span class="tab-badge">{{ notificationService.unreadCount() }}</span>
            }
          </button>

          <button
            class="tab-btn"
            [class.active]="activeTab() === 'payments'"
            (click)="activeTab.set('payments')">
            <i class="fa-solid fa-receipt me-1"></i> Payment Records
          </button>
        </div>

        <!-- TAB 1: PROFILE INFO & UPDATE -->
        @if (activeTab() === 'info') {
          <div class="row d-flex flex-wrap gap-4">
            <div class="col-lg-6 flex-grow-1" style="min-width: 320px;">
              <div class="card p-4">
                <h3 class="mb-4 section-heading">Edit Profile</h3>

                @if (updating()) {
                  <app-loading message="Saving profile changes..."></app-loading>
                } @else {
                  <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                    <div class="form-group mb-3">
                      <label class="form-label" for="profName">Full Name</label>
                      <input
                        id="profName"
                        type="text"
                        class="form-control"
                        formControlName="name" />
                    </div>

                    <div class="form-group mb-3">
                      <label class="form-label" for="profEmail">Email Address (Locked)</label>
                      <input
                        id="profEmail"
                        type="text"
                        class="form-control"
                        [value]="profile()?.email"
                        disabled />
                      <small class="text-dim">Email changes require identity verification.</small>
                    </div>

                    <div class="form-group mb-4">
                      <label class="form-label" for="profPhone">Mobile Phone Number</label>
                      <input
                        id="profPhone"
                        type="text"
                        class="form-control"
                        formControlName="phone" />
                    </div>

                    <div class="d-flex justify-content-end">
                      <button
                        type="submit"
                        class="btn btn-primary"
                        [disabled]="profileForm.invalid || profileForm.pristine || updating()">
                        Save Changes
                      </button>
                    </div>
                  </form>
                }
              </div>
            </div>

            <div class="col-lg-5 flex-grow-1" style="min-width: 280px;">
              <div class="card p-4">
                <h4 class="mb-3 section-heading">Account Status</h4>
                <div class="d-flex flex-column gap-3">
                  <div class="d-flex justify-content-between pb-2 border-bottom border-subtle">
                    <span class="text-dim">Membership Status</span>
                    <span class="badge badge-primary">{{ profile()?.status || 'Active' }}</span>
                  </div>
                  <div class="d-flex justify-content-between pb-2 border-bottom border-subtle">
                    <span class="text-dim">Role Permission</span>
                    <strong class="text-main">{{ authService.currentUser()?.role }}</strong>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span class="text-dim">Security</span>
                    <span class="text-primary font-bold"><i class="fa-solid fa-lock me-1"></i> JWT Authenticated</span>
                  </div>
                </div>
              </div>

              <!-- Theme & Appearance Card -->
              <div class="card p-4 mt-4">
                <h4 class="mb-2 section-heading">Theme & Appearance</h4>
                <p class="text-dim text-sm mb-3">Choose whether you prefer Dark Mode or Light Mode across the platform.</p>
                <div class="d-flex align-items-center justify-content-between p-2 rounded" style="background: var(--bg-surface);">
                  <span class="text-muted d-flex align-items-center gap-2">
                    <i class="fa-solid fa-circle-half-stroke"></i> Theme Mode
                  </span>
                  <div class="theme-pill-group">
                    <button
                      type="button"
                      class="theme-pill-btn"
                      [class.active]="themeService.isDark()"
                      (click)="themeService.setTheme('dark')"
                      title="Switch to Dark Mode">
                      <i class="fa-solid fa-moon"></i> Dark
                    </button>
                    <button
                      type="button"
                      class="theme-pill-btn"
                      [class.active]="themeService.isLight()"
                      (click)="themeService.setTheme('light')"
                      title="Switch to Light Mode">
                      <i class="fa-solid fa-sun"></i> Light
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- TAB 2: NOTIFICATIONS -->
        @if (activeTab() === 'notifications') {
          <div class="card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h3 class="mb-0 section-heading">Notifications Center</h3>
              <button class="btn btn-secondary btn-sm" (click)="loadNotifications()">
                <i class="fa-solid fa-rotate-right me-1"></i> Refresh
              </button>
            </div>

            @if (notificationsLoading()) {
              <app-loading message="Retrieving your notifications..."></app-loading>
            } @else if (notifications().length === 0) {
              <div class="text-center py-5 text-muted">
                <i class="fa-regular fa-bell-slash fs-2 mb-3 text-dim"></i>
                <p>No notifications yet. You will be notified here when bookings are confirmed.</p>
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
                        <div class="text-main font-500">{{ notif.message }}</div>
                        <small class="text-dim">{{ notif.createdAt | date:'medium' }}</small>
                      </div>
                    </div>
                    @if (!notif.isRead) {
                      <button
                        class="btn btn-sm btn-secondary py-0 px-2"
                        (click)="markNotificationRead(notif.id)">
                        Mark as Read
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- TAB 3: PAYMENT RECORDS -->
        @if (activeTab() === 'payments') {
          <div class="card p-4">
            <h3 class="mb-4 section-heading">Your Payment Records</h3>

            @if (paymentsLoading()) {
              <app-loading message="Loading payment transactions..."></app-loading>
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
                        <td><strong class="font-mono text-primary">{{ pay.receiptNumber }}</strong></td>
                        <td>#{{ pay.bookingId }}</td>
                        <td><strong class="text-primary">LKR {{ pay.amount | number }}</strong></td>
                        <td><small class="text-dim">{{ pay.paymentDate | date:'medium' }}</small></td>
                        <td><span class="badge badge-gold">Completed</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-big-avatar {
      width: 72px;
      height: 72px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: #FAF6EF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      font-family: var(--font-heading);
      font-weight: 700;
      border: 2px solid var(--accent);
      box-shadow: 0 4px 15px rgba(41, 73, 54, 0.25);
    }
    .page-title {
      font-family: var(--font-heading);
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .section-heading {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 600;
      padding: 0.6rem 1.15rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .tab-btn:hover { background: var(--hover-overlay); color: var(--text-main); }
    .tab-btn.active {
      background: var(--primary);
      color: #FAF6EF;
      box-shadow: 0 4px 12px rgba(41, 73, 54, 0.25);
    }
    .tab-badge {
      position: absolute; top: 0; right: 0;
      background: var(--accent); color: #1F2722; font-size: 0.7rem;
      padding: 0 5px; border-radius: 9px; font-weight: 700;
    }
    .notification-item {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      transition: all var(--transition-fast);
    }
    .notification-item.unread {
      border-left: 4px solid var(--primary);
      background: var(--primary-subtle);
    }
    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-medium); }
    .notif-dot.unread-dot { background: var(--accent); box-shadow: 0 0 8px rgba(181, 154, 91, 0.6); }
    .font-500 { font-weight: 500; }
    .font-mono { font-family: monospace; }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);
  private customerService = inject(CustomerService);
  notificationService = inject(NotificationService);
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);
  themeService = inject(ThemeService);

  activeTab = signal<string>('info');
  profile = signal<CustomerProfileDto | null>(null);
  notifications = signal<NotificationDto[]>([]);
  payments = signal<PaymentHistoryDto[]>([]);

  loading = signal<boolean>(true);
  updating = signal<boolean>(false);
  notificationsLoading = signal<boolean>(false);
  paymentsLoading = signal<boolean>(false);

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab.set(params['tab']);
      }
    });

    this.loadProfile();
    this.loadNotifications();
    this.loadPayments();
  }

  loadProfile(): void {
    const id = this.authService.getCustomerId();
    if (!id) return;

    this.customerService.getProfile(id).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.profileForm.patchValue({
          name: data.name,
          phone: data.phone
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  updateProfile(): void {
    const id = this.authService.getCustomerId();
    if (!id || this.profileForm.invalid) return;

    this.updating.set(true);
    this.customerService.updateProfile(id, this.profileForm.value).subscribe({
      next: () => {
        this.updating.set(false);
        this.toastService.success('Profile updated successfully!');
        this.profileForm.markAsPristine();
        this.loadProfile();
      },
      error: (err) => {
        this.updating.set(false);
        this.toastService.error(err.error?.message || 'Failed to update profile.');
      }
    });
  }

  loadNotifications(): void {
    const id = this.authService.getCustomerId();
    if (!id) return;

    this.notificationsLoading.set(true);
    this.notificationService.getNotifications(id).subscribe({
      next: (items) => {
        this.notifications.set(items || []);
        this.notificationsLoading.set(false);
      },
      error: () => this.notificationsLoading.set(false)
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

  loadPayments(): void {
    this.paymentsLoading.set(true);
    this.paymentService.getCustomerPayments().subscribe({
      next: (records) => {
        this.payments.set(records || []);
        this.paymentsLoading.set(false);
      },
      error: () => this.paymentsLoading.set(false)
    });
  }
}

export const UserProfileComponent = ProfileComponent;
export type UserProfileComponent = ProfileComponent;
export const CustomerProfileComponent = ProfileComponent;
export type CustomerProfileComponent = ProfileComponent;
