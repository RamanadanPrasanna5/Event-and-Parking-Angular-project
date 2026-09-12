import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarComponent, SidebarItem } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    SidebarComponent
  ],
  template: `
    <div class="admin-layout-wrapper d-flex flex-column min-vh-100">
      <app-navbar></app-navbar>

      <div class="admin-body d-flex flex-grow-1">
        <app-sidebar
          title="Admin Portal"
          brandIcon="fa-solid fa-shield-halved"
          [items]="adminNavItems">
        </app-sidebar>

        <main class="admin-workspace flex-grow-1 p-3 p-md-4">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .admin-layout-wrapper {
      min-height: 100vh;
      background-color: var(--bg-main);
    }
    .admin-body {
      display: flex;
      flex: 1 0 auto;
    }
    .admin-workspace {
      overflow-x: auto;
      background-color: var(--bg-main);
      min-height: calc(100vh - 140px);
    }
    @media (max-width: 768px) {
      .admin-body {
        flex-direction: column;
      }
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);

  adminNavItems: SidebarItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'fa-solid fa-chart-pie', exact: true },
    { label: 'Events', route: '/admin/events', icon: 'fa-regular fa-calendar-days' },
    { label: 'Categories', route: '/admin/categories', icon: 'fa-solid fa-tags' },
    { label: 'Venues', route: '/admin/venues', icon: 'fa-solid fa-landmark' },
    { label: 'Seats Setup', route: '/admin/seats', icon: 'fa-solid fa-couch' },
    { label: 'Parking Bays', route: '/admin/parking', icon: 'fa-solid fa-square-parking' },
    { label: 'Bookings Monitor', route: '/admin/bookings', icon: 'fa-solid fa-ticket' },
    { label: 'Customers', route: '/admin/customers', icon: 'fa-solid fa-users' },
    { label: 'Payments', route: '/admin/payments', icon: 'fa-solid fa-credit-card' },
    { label: 'Notifications', route: '/admin/notifications', icon: 'fa-regular fa-bell' }
  ];
}
