import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="mobile-bottom-nav d-md-none">
      <a [routerLink]="authService.isLoggedIn() ? '/customer/home' : '/'" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="bottom-nav-item">
        <i class="fa-solid fa-house bottom-nav-icon"></i>
        <span>Home</span>
      </a>

      <a routerLink="/events" routerLinkActive="active" class="bottom-nav-item">
        <i class="fa-regular fa-calendar-days bottom-nav-icon"></i>
        <span>Events</span>
      </a>

      <a routerLink="/my-bookings" routerLinkActive="active" class="bottom-nav-item">
        <i class="fa-solid fa-ticket bottom-nav-icon"></i>
        <span>Bookings</span>
      </a>

      <a routerLink="/notifications" routerLinkActive="active" class="bottom-nav-item position-relative">
        <i class="fa-regular fa-bell bottom-nav-icon"></i>
        @if (notificationService.unreadCount() > 0) {
          <span class="mobile-notif-dot"></span>
        }
        <span>Notifications</span>
      </a>

      <a [routerLink]="authService.isLoggedIn() ? '/profile' : '/login'" routerLinkActive="active" class="bottom-nav-item">
        <i class="fa-regular fa-user bottom-nav-icon"></i>
        <span>Profile</span>
      </a>
    </nav>
  `,
  styles: [`
    .mobile-bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-around;
      z-index: 999;
      padding: 0.25rem 0.5rem;
      box-shadow: 0 -2px 10px rgba(15, 23, 42, 0.04);
    }
    .bottom-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      font-size: 0.7rem;
      font-weight: 500;
      gap: 0.2rem;
      flex: 1;
      height: 100%;
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .bottom-nav-icon {
      font-size: 1.15rem;
    }
    .bottom-nav-item.active {
      color: var(--primary);
      font-weight: 700;
    }
    .bottom-nav-item:hover {
      color: var(--primary-hover);
    }
    .mobile-notif-dot {
      position: absolute;
      top: 8px;
      right: calc(50% - 14px);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--danger);
    }
  `]
})
export class MobileBottomNavComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
}
