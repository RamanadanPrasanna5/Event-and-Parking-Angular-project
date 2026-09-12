import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ConfirmationDialogComponent],
  template: `
    <header class="ep-navbar" [class.scrolled]="isScrolled">
      <div class="container">
        <div class="nav-inner">

          <!-- Logo -->
          <a [routerLink]="authService.isLoggedIn() ? (authService.currentUser()?.role === 'Admin' ? '/admin/dashboard' : '/customer/home') : '/'" class="ep-logo">
            <div class="logo-icon">
              <i class="fa-solid fa-calendar-check"></i>
              <span class="logo-dot"><i class="fa-solid fa-square-parking"></i></span>
            </div>
            <div class="logo-text">
              <span class="logo-name">Event<span class="logo-accent">Park</span></span>
            </div>
          </a>

          <!-- Center Nav Links (Desktop) -->
          <nav class="ep-nav-links d-none d-md-flex">
            <a [routerLink]="authService.isLoggedIn() ? (authService.currentUser()?.role === 'Admin' ? '/admin/dashboard' : '/customer/home') : '/'"
               routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="ep-nav-link">
              Home
            </a>
            <a routerLink="/events" routerLinkActive="active" class="ep-nav-link">
              Events
            </a>
            @if (authService.isLoggedIn() && authService.currentUser()?.role !== 'Admin') {
              <a routerLink="/my-bookings" routerLinkActive="active" class="ep-nav-link">
                My Bookings
              </a>
              <a routerLink="/notifications" routerLinkActive="active" class="ep-nav-link ep-nav-link-notif">
                Notifications
                @if (notificationService.unreadCount() > 0) {
                  <span class="notif-dot">{{ notificationService.unreadCount() }}</span>
                }
              </a>
            }
            @if (authService.isLoggedIn() && authService.currentUser()?.role === 'Admin') {
              <a routerLink="/admin/dashboard" routerLinkActive="active" class="ep-nav-link">
                Admin Panel
              </a>
            }
          </nav>

          <!-- Right Actions -->
          <div class="nav-right d-flex align-items-center gap-3">

            <!-- Booking Cart -->
            @if (bookingState.hasSelection()) {
              <a routerLink="/booking/summary" class="cart-pill d-none d-sm-flex">
                <i class="fa-solid fa-ticket"></i>
                <span>{{ bookingState.seatsCount() }} seat{{ bookingState.seatsCount() > 1 ? 's' : '' }}</span>
                <span class="cart-price">LKR {{ bookingState.grandTotal() | number:'1.0-0' }}</span>
                <i class="fa-solid fa-arrow-right cart-arrow"></i>
              </a>
            }

            @if (authService.isLoggedIn()) {
              <!-- Notifications Bell (mobile-friendly) -->
              <a routerLink="/notifications" class="nav-icon-btn d-none d-sm-flex position-relative" title="Notifications">
                <i class="fa-regular fa-bell"></i>
                @if (notificationService.unreadCount() > 0) {
                  <span class="notif-badge-dot"></span>
                }
              </a>

              <!-- User Dropdown -->
              <div class="user-menu position-relative">
                <button class="user-chip" (click)="toggleDropdown()">
                  <div class="user-avatar-circle">
                    {{ (authService.currentUser()?.email || 'U')[0].toUpperCase() }}
                  </div>
                  <span class="user-email-text d-none d-lg-block">{{ authService.currentUser()?.email }}</span>
                  <i class="fa-solid fa-chevron-down chevron" [class.rotated]="dropdownOpen"></i>
                </button>

                @if (dropdownOpen) {
                  <div class="user-dropdown animate-slideDown">
                    <div class="dropdown-user-info">
                      <div class="dropdown-avatar">
                        {{ (authService.currentUser()?.email || 'U')[0].toUpperCase() }}
                      </div>
                      <div>
                        <div class="dropdown-email">{{ authService.currentUser()?.email }}</div>
                        <span class="badge badge-primary">{{ authService.currentUser()?.role }}</span>
                      </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    @if (authService.currentUser()?.role === 'Admin') {
                      <a routerLink="/admin/dashboard" class="dropdown-item" (click)="dropdownOpen = false">
                        <i class="fa-solid fa-gauge-high"></i> Admin Dashboard
                      </a>
                    }
                    <a routerLink="/customer/home" class="dropdown-item" (click)="dropdownOpen = false">
                      <i class="fa-solid fa-home"></i> My Home
                    </a>
                    <a routerLink="/events" class="dropdown-item" (click)="dropdownOpen = false">
                      <i class="fa-regular fa-calendar-days"></i> Browse Events
                    </a>
                    <a routerLink="/my-bookings" class="dropdown-item" (click)="dropdownOpen = false">
                      <i class="fa-solid fa-ticket"></i> My Bookings
                    </a>
                    <a routerLink="/profile" class="dropdown-item" (click)="dropdownOpen = false">
                      <i class="fa-regular fa-user"></i> My Profile
                    </a>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item dropdown-item-danger" (click)="promptLogout()">
                      <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                    </button>
                  </div>
                }
              </div>

            } @else {
              <!-- Guest Actions -->
              <a routerLink="/login" class="btn btn-secondary btn-sm d-none d-sm-inline-flex">Log in</a>
              <a routerLink="/register" class="btn btn-primary btn-sm">Sign up</a>
            }

            <!-- Mobile Hamburger -->
            <button class="hamburger d-md-none" (click)="mobileMenuOpen = !mobileMenuOpen" aria-label="Menu">
              <span [class]="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'" class="fa-fw"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen) {
        <div class="mobile-nav animate-slideDown">
          <div class="container">
            <div class="mobile-nav-links">
              <a [routerLink]="authService.isLoggedIn() ? '/customer/home' : '/'" class="mobile-link" (click)="mobileMenuOpen = false">
                <i class="fa-solid fa-home"></i> Home
              </a>
              <a routerLink="/events" class="mobile-link" (click)="mobileMenuOpen = false">
                <i class="fa-regular fa-calendar-days"></i> Events
              </a>
              @if (authService.isLoggedIn()) {
                <a routerLink="/my-bookings" class="mobile-link" (click)="mobileMenuOpen = false">
                  <i class="fa-solid fa-ticket"></i> My Bookings
                </a>
                <a routerLink="/notifications" class="mobile-link" (click)="mobileMenuOpen = false">
                  <i class="fa-regular fa-bell"></i> Notifications
                  @if (notificationService.unreadCount() > 0) {
                    <span class="badge badge-danger ms-1">{{ notificationService.unreadCount() }}</span>
                  }
                </a>
                <a routerLink="/profile" class="mobile-link" (click)="mobileMenuOpen = false">
                  <i class="fa-regular fa-user"></i> My Profile
                </a>
                @if (authService.currentUser()?.role === 'Admin') {
                  <a routerLink="/admin/dashboard" class="mobile-link" (click)="mobileMenuOpen = false">
                    <i class="fa-solid fa-gauge-high"></i> Admin Panel
                  </a>
                }
                <div class="mobile-divider"></div>
                <button class="mobile-link mobile-link-danger" (click)="promptLogout()">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                </button>
              } @else {
                <div class="mobile-divider"></div>
                <div class="d-flex gap-3">
                  <a routerLink="/login" class="btn btn-secondary btn-sm flex-grow-1" (click)="mobileMenuOpen = false">Log in</a>
                  <a routerLink="/register" class="btn btn-primary btn-sm flex-grow-1" (click)="mobileMenuOpen = false">Sign up</a>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </header>

    <!-- Logout Confirmation -->
    <app-confirmation-dialog
      [isOpen]="showLogoutModal"
      title="Sign out of EventPark?"
      message="You will need to sign in again to access your bookings and profile."
      confirmText="Sign Out"
      cancelText="Cancel"
      [isDanger]="true"
      (confirm)="confirmLogout()"
      (cancel)="showLogoutModal = false">
    </app-confirmation-dialog>
  `,
  styles: [`
    .ep-navbar {
      position: sticky;
      top: 0;
      z-index: 900;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-subtle);
      height: 64px;
      display: flex;
      align-items: center;
      transition: box-shadow 0.2s ease;
    }
    .ep-navbar.scrolled {
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
    }
    .nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 1rem;
    }

    /* Logo */
    .ep-logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon {
      position: relative;
      width: 36px;
      height: 36px;
      background: var(--primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 1rem;
    }
    .logo-dot {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      background: var(--accent);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.55rem;
      color: #FFFFFF;
      border: 2px solid #FFFFFF;
    }
    .logo-name {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.3px;
    }
    .logo-accent { color: var(--primary); }

    /* Center Nav */
    .ep-nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .ep-nav-link {
      position: relative;
      padding: 0.45rem 0.875rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .ep-nav-link:hover {
      color: var(--text-main);
      background: var(--bg-surface-alt);
    }
    .ep-nav-link.active {
      color: var(--primary);
      background: var(--primary-light);
      font-weight: 600;
    }
    .notif-dot {
      background: var(--danger);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: 99px;
      line-height: 1.4;
    }

    /* Right */
    .nav-right { flex-shrink: 0; }

    /* Cart Pill */
    .cart-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.875rem;
      background: var(--primary-light);
      border: 1px solid var(--primary-subtle);
      border-radius: 99px;
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--primary);
      transition: all 0.15s ease;
    }
    .cart-pill:hover { background: var(--primary-subtle); color: var(--primary); }
    .cart-price { opacity: 0.8; font-weight: 500; }
    .cart-arrow { font-size: 0.7rem; transition: transform 0.15s; }
    .cart-pill:hover .cart-arrow { transform: translateX(2px); }

    /* Nav Icon Button */
    .nav-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .nav-icon-btn:hover { color: var(--primary); border-color: var(--primary-subtle); background: var(--primary-light); }
    .notif-badge-dot {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 8px;
      height: 8px;
      background: var(--danger);
      border-radius: 50%;
      border: 2px solid #FFFFFF;
    }

    /* User Chip */
    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0.75rem 0.3rem 0.35rem;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: 99px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: var(--font-body);
    }
    .user-chip:hover { border-color: var(--border-medium); background: var(--bg-surface-hover); }
    .user-avatar-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: #FFFFFF;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-email-text {
      font-size: 0.825rem;
      font-weight: 500;
      color: var(--text-main);
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chevron { font-size: 0.7rem; color: var(--text-dim); transition: transform 0.15s; }
    .chevron.rotated { transform: rotate(180deg); }

    /* Dropdown */
    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 240px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      z-index: 1000;
      overflow: hidden;
    }
    .dropdown-user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1rem 0.75rem;
    }
    .dropdown-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--primary);
      color: #FFFFFF;
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .dropdown-email {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-main);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 150px;
      margin-bottom: 0.25rem;
    }
    .dropdown-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 0.35rem 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      width: 100%;
      padding: 0.55rem 1rem;
      font-size: 0.875rem;
      color: var(--text-muted);
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: all 0.12s ease;
      font-family: var(--font-body);
      text-decoration: none;
    }
    .dropdown-item:hover { background: var(--bg-surface-alt); color: var(--text-main); }
    .dropdown-item i { width: 16px; text-align: center; opacity: 0.7; }
    .dropdown-item-danger { color: var(--danger); }
    .dropdown-item-danger:hover { background: var(--danger-light); color: var(--danger); }

    /* Hamburger */
    .hamburger {
      width: 36px;
      height: 36px;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      color: var(--text-main);
      cursor: pointer;
    }

    /* Mobile Menu */
    .mobile-nav {
      border-top: 1px solid var(--border-subtle);
      background: #FFFFFF;
      box-shadow: var(--shadow-lg);
    }
    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      padding: 0.75rem 0;
      gap: 0.15rem;
    }
    .mobile-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0.5rem;
      font-size: 0.95rem;
      color: var(--text-main);
      font-weight: 500;
      border-radius: var(--radius-sm);
      transition: all 0.12s ease;
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-body);
      text-align: left;
      text-decoration: none;
    }
    .mobile-link:hover { background: var(--bg-surface-alt); color: var(--primary); }
    .mobile-link i { width: 18px; text-align: center; color: var(--text-dim); }
    .mobile-link-danger { color: var(--danger); }
    .mobile-link-danger:hover { background: var(--danger-light); color: var(--danger); }
    .mobile-divider { height: 1px; background: var(--border-subtle); margin: 0.5rem 0; }
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  bookingState = inject(BookingStateService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  isScrolled = false;
  dropdownOpen = false;
  mobileMenuOpen = false;
  showLogoutModal = false;

  ngOnInit(): void {
    this.notificationService.refreshUnread();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  promptLogout(): void {
    this.dropdownOpen = false;
    this.mobileMenuOpen = false;
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout('/login');
  }
}
