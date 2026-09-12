import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface SidebarItem {
  label: string;
  route: string;
  icon: string;
  badge?: string | number;
  badgeClass?: string;
  exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="ep-sidebar" [class.collapsed]="isCollapsed">

      <!-- Sidebar Header -->
      <div class="sidebar-head">
        @if (!isCollapsed) {
          <div class="sidebar-brand">
            <div class="sidebar-logo">
              <i class="fa-solid fa-calendar-check"></i>
              <span class="logo-dot-sm"><i class="fa-solid fa-square-parking"></i></span>
            </div>
            <div>
              <div class="sidebar-brand-name">EventPark</div>
              <div class="sidebar-brand-sub">Admin Portal</div>
            </div>
          </div>
        }
        <button class="collapse-btn" (click)="toggleCollapse()" [title]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <i class="fa-solid" [class.fa-bars]="isCollapsed" [class.fa-chevron-left]="!isCollapsed"></i>
        </button>
      </div>

      <!-- Navigation -->
      <div class="sidebar-nav-wrap">
        <nav class="sidebar-nav">
          @for (item of items; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact || false }"
              class="nav-item"
              [title]="item.label">
              <div class="nav-item-icon">
                <i [class]="item.icon"></i>
              </div>
              @if (!isCollapsed) {
                <span class="nav-item-label">{{ item.label }}</span>
                @if (item.badge) {
                  <span class="ms-auto badge" [class]="item.badgeClass || 'badge-primary'">{{ item.badge }}</span>
                }
              }
            </a>
          }
        </nav>
      </div>

      <!-- Footer -->
      @if (!isCollapsed) {
        <div class="sidebar-foot">
          <div class="sidebar-user">
            <div class="sidebar-avatar">
              {{ (authService.currentUser()?.email || 'A')[0].toUpperCase() }}
            </div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-email">{{ authService.currentUser()?.email }}</div>
              <div class="sidebar-user-role">{{ authService.currentUser()?.role }}</div>
            </div>
          </div>
          <button class="btn btn-outline-gray btn-sm w-100" (click)="logout()">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
          </button>
        </div>
      }
    </aside>
  `,
  styles: [`
    .ep-sidebar {
      width: 248px;
      min-height: calc(100vh - 64px);
      background: #FFFFFF;
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      flex-shrink: 0;
    }
    .ep-sidebar.collapsed { width: 64px; }

    /* Header */
    .sidebar-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0.875rem;
      border-bottom: 1px solid var(--border-subtle);
      min-height: 64px;
      gap: 0.5rem;
    }
    .sidebar-brand { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
    .sidebar-logo {
      position: relative;
      width: 32px;
      height: 32px;
      background: var(--primary);
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 0.875rem;
      flex-shrink: 0;
    }
    .logo-dot-sm {
      position: absolute;
      bottom: -3px;
      right: -3px;
      width: 13px;
      height: 13px;
      background: var(--accent);
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.45rem;
      color: #FFFFFF;
      border: 1.5px solid #FFFFFF;
    }
    .sidebar-brand-name { font-family: var(--font-heading); font-size: 0.95rem; font-weight: 800; color: var(--text-main); line-height: 1; }
    .sidebar-brand-sub { font-size: 0.7rem; color: var(--text-dim); margin-top: 0.1rem; }

    .collapse-btn {
      width: 28px;
      height: 28px;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.12s;
    }
    .collapse-btn:hover { color: var(--primary); border-color: var(--primary-subtle); }

    /* Nav */
    .sidebar-nav-wrap { flex: 1; overflow-y: auto; padding: 0.75rem 0.625rem; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 2px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.12s ease;
      min-height: 40px;
    }
    .nav-item:hover { background: var(--bg-surface-alt); color: var(--text-main); }
    .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
    .nav-item.active .nav-item-icon { color: var(--primary); }

    .nav-item-icon {
      width: 20px;
      text-align: center;
      font-size: 0.95rem;
      flex-shrink: 0;
      color: var(--text-dim);
    }
    .nav-item.active .nav-item-icon { color: var(--primary); }
    .nav-item-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Footer */
    .sidebar-foot {
      padding: 0.875rem;
      border-top: 1px solid var(--border-subtle);
    }
    .sidebar-user {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.75rem;
      min-width: 0;
    }
    .sidebar-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      color: #FFFFFF;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .sidebar-user-info { min-width: 0; }
    .sidebar-user-email { font-size: 0.78rem; font-weight: 600; color: var(--text-main); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sidebar-user-role { font-size: 0.68rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; }

    .w-100 { width: 100%; }

    @media (max-width: 768px) {
      .ep-sidebar { width: 100%; min-height: auto; border-right: none; border-bottom: 1px solid var(--border-subtle); }
      .ep-sidebar.collapsed { width: 100%; }
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  @Input() title: string = 'Navigation';
  @Input() brandIcon: string = 'fa-solid fa-chart-pie';
  @Input() items: SidebarItem[] = [];

  isCollapsed: boolean = false;

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
