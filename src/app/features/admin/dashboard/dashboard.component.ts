import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { DashboardMetricsDto } from '../../../core/models/dashboard.models';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, LoadingSpinnerComponent, ErrorBannerComponent],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span class="badge badge-primary mb-2">System Analytics</span>
          <h1 class="page-title mb-1">Administrative Overview</h1>
          <p class="text-muted mb-0">Live aggregated metrics from backend database</p>
        </div>

        <button class="btn btn-outline btn-sm" (click)="loadMetrics()">
          <i class="fa-solid fa-rotate-right me-1"></i> Refresh Data
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Aggregating system statistics..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadMetrics()"></app-error-banner>
      } @else if (metrics()) {
        <!-- METRICS CARDS -->
        <div class="grid grid-cols-3 gap-4 mb-5">
          <app-stat-card
            label="Total Revenue"
            [value]="'LKR ' + (metrics()!.totalRevenue | number)"
            icon="fa-solid fa-money-bill-wave"
            iconColor="#34D399"
            iconBg="rgba(16, 185, 129, 0.15)"
            hint="Recorded simulated payments"
            [trendUp]="true">
          </app-stat-card>

          <app-stat-card
            label="Total Bookings"
            [value]="metrics()!.totalBookings"
            icon="fa-solid fa-ticket"
            iconColor="#818CF8"
            iconBg="rgba(99, 102, 241, 0.15)"
            hint="Active and confirmed orders">
          </app-stat-card>

          <app-stat-card
            label="Active Events"
            [value]="metrics()!.totalEvents"
            icon="fa-regular fa-calendar-check"
            iconColor="#FBBF24"
            iconBg="rgba(245, 158, 11, 0.15)"
            hint="Scheduled in catalogue">
          </app-stat-card>

          <app-stat-card
            label="Registered Customers"
            [value]="metrics()!.totalCustomers"
            icon="fa-solid fa-users"
            iconColor="#60A5FA"
            iconBg="rgba(59, 130, 246, 0.15)"
            hint="Total verified user accounts">
          </app-stat-card>

          <app-stat-card
            label="Available Seats"
            [value]="metrics()!.availableSeats"
            icon="fa-solid fa-couch"
            iconColor="#A78BFA"
            iconBg="rgba(167, 139, 250, 0.15)"
            hint="Open for reservation">
          </app-stat-card>

          <app-stat-card
            label="Occupied Parking Bays"
            [value]="metrics()!.occupiedParkingSlots"
            icon="fa-solid fa-square-parking"
            iconColor="#F87171"
            iconBg="rgba(239, 68, 68, 0.15)"
            hint="Allocated to customer bookings">
          </app-stat-card>
        </div>

        <!-- QUICK MANAGEMENT ACTIONS -->
        <h3 class="mb-3">Management Shortcuts</h3>
        <div class="grid grid-cols-3 gap-3">
          <a routerLink="/admin/events" class="card card-hoverable p-3 d-flex align-items-center gap-3">
            <div class="action-icon bg-primary-subtle text-primary">
              <i class="fa-solid fa-calendar-plus"></i>
            </div>
            <div>
              <h5 class="mb-1 text-white">Create New Event</h5>
              <small class="text-dim">Schedule date, venue & tickets</small>
            </div>
          </a>

          <a routerLink="/admin/seats" class="card card-hoverable p-3 d-flex align-items-center gap-3">
            <div class="action-icon bg-warning-subtle text-warning">
              <i class="fa-solid fa-couch"></i>
            </div>
            <div>
              <h5 class="mb-1 text-white">Generate Seat Map</h5>
              <small class="text-dim">Configure rows & base ticket prices</small>
            </div>
          </a>

          <a routerLink="/admin/parking" class="card card-hoverable p-3 d-flex align-items-center gap-3">
            <div class="action-icon bg-info-subtle text-info">
              <i class="fa-solid fa-square-parking"></i>
            </div>
            <div>
              <h5 class="mb-1 text-white">Setup Parking Layout</h5>
              <small class="text-dim">Define zones and bay fees</small>
            </div>
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title { font-size: 2.25rem; font-weight: 800; }
    .action-icon {
      width: 48px; height: 48px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.35rem; flex-shrink: 0;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  metrics = signal<DashboardMetricsDto | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to retrieve metrics from backend dashboard API.');
      }
    });
  }
}
