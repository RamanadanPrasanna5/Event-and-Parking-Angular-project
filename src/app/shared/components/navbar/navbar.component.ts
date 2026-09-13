import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="navbar-header" [class.scrolled]="isScrolled">
      <div class="container d-flex align-items-center justify-content-between">
        <!-- Logo -->
        <a routerLink="/" class="brand-logo d-flex align-items-center gap-2">
          <div class="brand-icon">
            <i class="fa-solid fa-ticket"></i>
          </div>
          <span class="brand-text">EVENT<span class="brand-accent">PARK</span></span>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="nav-links d-none d-md-flex align-items-center">
          <a routerLink="/events" routerLinkActive="active" class="nav-link">
            <i class="fa-regular fa-calendar-days me-1"></i> Browse Events
          </a>

          @if (authService.isLoggedIn()) {
            <a routerLink="/reservations/my-reservations" routerLinkActive="active" class="nav-link">
              <i class="fa-solid fa-receipt me-1"></i> My Bookings
            </a>
          }

          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-link admin-nav-link">
              <i class="fa-solid fa-shield-halved me-1"></i> Admin Portal
            </a>
          }
        </nav>

        <!-- Right Action Items -->
        <div class="nav-actions d-flex align-items-center gap-2 gap-sm-3">
          <!-- Active Cart / Selection Chip -->
          @if (bookingState.hasSelection()) {
            <a routerLink="/reservations/make-reservation" class="cart-chip d-flex align-items-center gap-2" title="Proceed to reservation">
              <span class="cart-badge">{{ bookingState.seatsCount() }}</span>
              <span class="cart-total">LKR {{ bookingState.grandTotal() | number }}</span>
              <i class="fa-solid fa-arrow-right cart-arrow"></i>
            </a>
          }

          <!-- Dark / Light Theme Toggle Button -->
          <button
            type="button"
            class="theme-toggle-btn"
            (click)="themeService.toggleTheme()"
            [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            [attr.aria-label]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            @if (themeService.isDark()) {
              <i class="fa-solid fa-sun theme-icon icon-sun text-warning"></i>
            } @else {
              <i class="fa-solid fa-moon theme-icon icon-moon text-primary"></i>
            }
          </button>

          <!-- Notifications Bell (Customer Only) -->
          @if (authService.isLoggedIn()) {
            <div class="notification-wrapper">
              <a routerLink="/profile" [queryParams]="{ tab: 'notifications' }" class="nav-icon-btn" title="Notifications">
                <i class="fa-regular fa-bell"></i>
                @if (notificationService.unreadCount() > 0) {
                  <span class="notif-badge">{{ notificationService.unreadCount() }}</span>
                }
              </a>
            </div>

            <!-- User Menu -->
            <div class="user-menu-wrapper position-relative">
              <button class="user-profile-btn d-flex align-items-center gap-2" (click)="toggleDropdown()">
                <div class="user-avatar">
                  {{ (authService.currentUser()?.email || 'U')[0].toUpperCase() }}
                </div>
                <div class="user-info-text d-none d-lg-block text-start">
                  <div class="user-email">{{ authService.currentUser()?.email }}</div>
                  <div class="user-role-badge">
                    <span class="badge" [class.badge-primary]="authService.isAdmin()" [class.badge-info]="!authService.isAdmin()">
                      {{ authService.currentUser()?.role }}
                    </span>
                  </div>
                </div>
                <i class="fa-solid fa-chevron-down dropdown-arrow" [class.rotated]="dropdownOpen"></i>
              </button>

              @if (dropdownOpen) {
                <div class="user-dropdown-menu">
                  <div class="dropdown-header">
                    <small class="text-dim">Signed in as</small>
                    <div class="font-bold text-truncate">{{ authService.currentUser()?.email }}</div>
                  </div>
                  <hr class="dropdown-divider">
                  <a routerLink="/profile" class="dropdown-item" (click)="dropdownOpen = false">
                    <i class="fa-regular fa-user"></i> My Profile
                  </a>
                  <a routerLink="/reservations/my-reservations" class="dropdown-item" (click)="dropdownOpen = false">
                    <i class="fa-solid fa-ticket"></i> My Reservations
                  </a>
                  @if (authService.isAdmin()) {
                    <a routerLink="/admin" class="dropdown-item" (click)="dropdownOpen = false">
                      <i class="fa-solid fa-chart-pie"></i> Admin Dashboard
                    </a>
                  }
                  <hr class="dropdown-divider">
                  <button class="dropdown-item d-flex align-items-center justify-content-between" (click)="themeService.toggleTheme()">
                    <span class="d-flex align-items-center gap-2">
                      @if (themeService.isDark()) {
                        <i class="fa-solid fa-sun text-warning"></i> Light Mode
                      } @else {
                        <i class="fa-solid fa-moon text-primary"></i> Dark Mode
                      }
                    </span>
                    <span class="badge badge-neutral text-capitalize">{{ themeService.currentTheme() }}</span>
                  </button>
                  <hr class="dropdown-divider">
                  <button class="dropdown-item text-danger" (click)="logout()">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                  </button>
                </div>
              }
            </div>
          } @else {
            <!-- Guest Links -->
            <a routerLink="/login" class="btn btn-sm btn-outline">Sign In</a>
            <a routerLink="/register" class="btn btn-sm btn-primary d-none d-sm-inline-flex">Get Started</a>
          }

          <!-- Mobile Hamburger -->
          <button class="mobile-toggle d-md-none" (click)="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle Navigation">
            <i [class]="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      @if (mobileMenuOpen) {
        <div class="mobile-menu d-md-none">
          <div class="container d-flex flex-column gap-3 py-3">
            <a routerLink="/events" class="mobile-link" (click)="mobileMenuOpen = false">
              <i class="fa-regular fa-calendar-days"></i> Browse Events
            </a>
            @if (authService.isLoggedIn()) {
              <a routerLink="/reservations/my-reservations" class="mobile-link" (click)="mobileMenuOpen = false">
                <i class="fa-solid fa-receipt"></i> My Bookings
              </a>
              <a routerLink="/profile" class="mobile-link" (click)="mobileMenuOpen = false">
                <i class="fa-regular fa-user"></i> Profile & Notifications
              </a>
              @if (authService.isAdmin()) {
                <a routerLink="/admin" class="mobile-link text-primary" (click)="mobileMenuOpen = false">
                  <i class="fa-solid fa-shield-halved"></i> Admin Portal
                </a>
              }
            } @else {
              <a routerLink="/login" class="btn btn-outline btn-sm" (click)="mobileMenuOpen = false">Sign In</a>
              <a routerLink="/register" class="btn btn-primary btn-sm" (click)="mobileMenuOpen = false">Create Account</a>
            }

            <!-- Appearance Theme Switcher in Mobile Menu -->
            <div class="d-flex align-items-center justify-content-between py-2 border-top border-bottom border-subtle">
              <span class="text-muted d-flex align-items-center gap-2">
                <i class="fa-solid fa-circle-half-stroke"></i> Theme
              </span>
              <div class="theme-pill-group">
                <button
                  type="button"
                  class="theme-pill-btn"
                  [class.active]="themeService.isDark()"
                  (click)="themeService.setTheme('dark')">
                  <i class="fa-solid fa-moon"></i> Dark
                </button>
                <button
                  type="button"
                  class="theme-pill-btn"
                  [class.active]="themeService.isLight()"
                  (click)="themeService.setTheme('light')">
                  <i class="fa-solid fa-sun"></i> Light
                </button>
              </div>
            </div>

            @if (authService.isLoggedIn()) {
              <button class="btn btn-danger btn-sm mt-1" (click)="logout()">Sign Out</button>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar-header {
      position: sticky;
      top: 0;
      z-index: 900;
      background: var(--nav-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-subtle);
      transition: all var(--transition-normal);
      height: 72px;
      display: flex;
      align-items: center;
    }
    .navbar-header.scrolled {
      background: var(--nav-bg-scrolled);
      box-shadow: var(--shadow-sm);
      border-bottom-color: var(--border-medium);
    }
    .brand-logo {
      font-family: var(--font-heading);
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--text-main);
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 1.05rem;
      box-shadow: 0 4px 14px var(--primary-glow);
    }
    .brand-text {
      letter-spacing: 0.5px;
      color: var(--text-main);
      font-weight: 800;
    }
    .brand-accent {
      background: linear-gradient(135deg, #6C7CFF 0%, #A855F7 50%, #EC4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }
    .nav-links .nav-link {
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      padding: 0.5rem 0.2rem;
      margin: 0 1rem;
      position: relative;
      transition: color var(--transition-fast);
    }
    .nav-links .nav-link:hover {
      color: var(--text-main);
    }
    .nav-links .nav-link.active {
      color: var(--primary);
      font-weight: 700;
    }
    .nav-links .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 2px;
      box-shadow: 0 0 8px var(--primary-glow);
    }
    .admin-nav-link {
      color: var(--primary) !important;
      background: var(--primary-subtle);
      border: 1px solid rgba(41, 73, 54, 0.2);
      border-radius: var(--radius-pill) !important;
      padding: 0.35rem 0.85rem !important;
      margin-left: 0.5rem !important;
    }
    .admin-nav-link.active::after {
      display: none;
    }
    .cart-chip {
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-pill);
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 600;
      transition: all var(--transition-fast);
    }
    .cart-chip:hover {
      border-color: var(--primary);
      background: var(--bg-elevated);
    }
    .cart-badge {
      background: var(--primary);
      color: #FFFFFF;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .cart-arrow {
      font-size: 0.75rem;
      transition: transform var(--transition-fast);
      color: var(--accent-gold);
    }
    .cart-chip:hover .cart-arrow {
      transform: translateX(3px);
    }
    .nav-icon-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      position: relative;
      transition: all var(--transition-fast);
    }
    .nav-icon-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
      background: var(--bg-elevated);
    }
    .notif-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger);
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .user-profile-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-medium);
      padding: 0.35rem 0.75rem 0.35rem 0.45rem;
      border-radius: var(--radius-pill);
      cursor: pointer;
      color: var(--text-main);
      transition: all var(--transition-fast);
    }
    .user-profile-btn:hover {
      border-color: var(--primary);
      background: var(--bg-elevated);
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 2px 8px var(--primary-glow);
    }
    .user-email {
      font-size: 0.8rem;
      font-weight: 600;
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role-badge .badge {
      font-size: 0.65rem;
      padding: 0.15rem 0.45rem;
    }
    .dropdown-arrow {
      font-size: 0.75rem;
      color: var(--text-dim);
      transition: transform var(--transition-fast);
    }
    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }
    .user-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 220px;
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 0.5rem;
      z-index: 1000;
      animation: scaleUp 0.15s ease-out;
    }
    .dropdown-header {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
    }
    .dropdown-divider {
      border: none;
      border-top: 1px solid var(--border-subtle);
      margin: 0.35rem 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.875rem;
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
    }
    .dropdown-item:hover {
      background: var(--hover-overlay);
      color: var(--primary);
    }
    .theme-toggle-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-pill);
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.05rem;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }
    .theme-toggle-btn:hover {
      background: var(--hover-overlay);
      border-color: var(--border-medium);
      transform: scale(1.06);
    }
    .theme-toggle-btn:active {
      transform: scale(0.95);
    }
    .theme-pill-group {
      display: inline-flex;
      background: var(--bg-surface);
      padding: 3px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border-subtle);
      gap: 2px;
    }
    .theme-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-pill);
      font-size: 0.78rem;
      font-weight: 600;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .theme-pill-btn.active {
      background: var(--primary);
      color: var(--text-on-primary);
      box-shadow: var(--shadow-sm);
    }
    .mobile-toggle {
      background: none;
      border: none;
      color: var(--text-main);
      font-size: 1.35rem;
      cursor: pointer;
    }
    .mobile-menu {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-medium);
      animation: fadeIn 0.2s ease;
    }
    .mobile-link {
      color: var(--text-main);
      padding: 0.5rem 0;
      font-size: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
    }
    .mobile-link:hover {
      color: var(--primary);
    }
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  bookingState = inject(BookingStateService);
  notificationService = inject(NotificationService);
  themeService = inject(ThemeService);
  private router = inject(Router);


  isScrolled = false;
  dropdownOpen = false;
  mobileMenuOpen = false;

  ngOnInit(): void {
    const customerId = this.authService.getCustomerId();
    if (customerId) {
      this.notificationService.refreshUnread(customerId);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 15;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout(): void {
    this.dropdownOpen = false;
    this.mobileMenuOpen = false;
    this.authService.logout('/login');
  }
}
