import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';


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
    <aside class="sidebar-wrapper" [class.collapsed]="isCollapsed">
      <div class="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom border-subtle">
        <div class="d-flex align-items-center gap-2" *ngIf="!isCollapsed">
          <div class="brand-icon">
            <i [class]="brandIcon"></i>
          </div>
          <span class="brand-title font-bold">{{ title }}</span>
        </div>
        <button class="btn btn-icon btn-outline btn-sm toggle-btn" (click)="toggleCollapse()" title="Toggle sidebar">
          <i class="fa-solid" [class.fa-bars]="isCollapsed" [class.fa-chevron-left]="!isCollapsed"></i>
        </button>
      </div>

      <div class="sidebar-body py-3">
        <nav class="sidebar-nav d-flex flex-column gap-1 px-2">
          @for (item of items; track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact || false }"
              class="sidebar-link d-flex align-items-center gap-3 px-3 py-2"
              [title]="item.label">
              <i [class]="item.icon" class="sidebar-icon"></i>
              <span class="sidebar-label" *ngIf="!isCollapsed">{{ item.label }}</span>
              @if (item.badge && !isCollapsed) {
                <span class="badge ms-auto" [class]="item.badgeClass || 'badge-primary'">{{ item.badge }}</span>
              }
            </a>
          }
        </nav>
      </div>

      <div class="sidebar-footer p-3 border-top border-subtle mt-auto" *ngIf="!isCollapsed">
        <!-- Theme Toggle in Sidebar Footer -->
        <div class="d-flex align-items-center justify-content-between mb-3 p-1 rounded" style="background: var(--bg-surface);">
          <small class="text-dim ps-2"><i class="fa-solid fa-circle-half-stroke me-1"></i> Theme</small>
          <div class="theme-pill-group">
            <button
              type="button"
              class="theme-pill-btn"
              [class.active]="themeService.isDark()"
              (click)="themeService.setTheme('dark')"
              title="Switch to Dark Mode">
              <i class="fa-solid fa-moon"></i>
            </button>
            <button
              type="button"
              class="theme-pill-btn"
              [class.active]="themeService.isLight()"
              (click)="themeService.setTheme('light')"
              title="Switch to Light Mode">
              <i class="fa-solid fa-sun"></i>
            </button>
          </div>
        </div>

        <div class="user-brief d-flex align-items-center gap-2 mb-2">
          <div class="user-avatar-sm">
            {{ (authService.currentUser()?.email || 'U')[0].toUpperCase() }}
          </div>
          <div class="user-brief-info overflow-hidden">
            <div class="user-email-text text-truncate">{{ authService.currentUser()?.email }}</div>
            <small class="text-dim text-uppercase">{{ authService.currentUser()?.role }}</small>
          </div>
        </div>
        <button class="btn btn-outline btn-sm w-100" (click)="logout()">
          <i class="fa-solid fa-arrow-right-from-bracket me-1"></i> Sign Out
        </button>
      </div>

      <!-- Collapsed State Theme Toggle -->
      <div class="sidebar-footer p-2 border-top border-subtle text-center mt-auto" *ngIf="isCollapsed">
        <button
          type="button"
          class="theme-toggle-btn"
          style="width: 38px; height: 38px;"
          (click)="themeService.toggleTheme()"
          [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          @if (themeService.isDark()) {
            <i class="fa-solid fa-sun theme-icon icon-sun" style="font-size: 0.95rem;"></i>
          } @else {
            <i class="fa-solid fa-moon theme-icon icon-moon" style="font-size: 0.95rem;"></i>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-wrapper {
      width: 260px;
      min-height: calc(100vh - 76px);
      background: var(--bg-card);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      transition: width var(--transition-normal);
      font-family: var(--font-sans);
    }
    .sidebar-wrapper.collapsed {
      width: 72px;
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      background: var(--primary-subtle);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }
    .brand-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text-main);
    }
    .sidebar-link {
      color: var(--text-muted);
      border-radius: var(--radius-md);
      font-size: 0.885rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      text-decoration: none;
      position: relative;
    }
    .sidebar-link:hover {
      background: var(--hover-overlay);
      color: var(--text-main);
    }
    .sidebar-link.active {
      background: var(--primary);
      color: #FAF6EF;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(41, 73, 54, 0.25);
    }
    .sidebar-icon {
      font-size: 1rem;
      width: 20px;
      text-align: center;
    }
    .sidebar-label {
      white-space: nowrap;
    }
    .user-avatar-sm {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      flex-shrink: 0;
      border: 1px solid var(--accent);
    }
    .user-email-text {
      font-size: 0.825rem;
      color: var(--text-main);
      font-weight: 600;
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
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
