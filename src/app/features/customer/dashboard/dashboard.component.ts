import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CategoryService } from '../../../core/services/category.service';
import { EventDto } from '../../../core/models/event.model';
import { EventCategory } from '../../../core/models/category.model';
import { EventCardComponent } from '../../events/event-card/event-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-customer-dashboard, app-customer-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, EventCardComponent, LoadingComponent],
  template: `
    <div class="ep-dashboard">
      <!-- HERO + SEARCH -->
      <section class="dash-hero">
        <div class="container">
          <div class="dash-hero-inner">
            <div class="dash-welcome">
              <span class="badge badge-primary mb-2">Customer Portal</span>
              <h1 class="dash-title">Find your next event</h1>
              <p class="dash-sub">Discover live performances, choose your seats, and reserve parking.</p>
            </div>
            <div class="dash-user-chip d-none d-md-flex">
              <a routerLink="/notifications" class="notif-btn position-relative" title="Notifications">
                <i class="fa-regular fa-bell"></i>
                @if (notificationService.unreadCount() > 0) {
                  <span class="notif-count">{{ notificationService.unreadCount() }}</span>
                }
              </a>
              <a routerLink="/profile" class="profile-chip">
                <div class="profile-avatar">{{ (authService.currentUser()?.email || 'U')[0].toUpperCase() }}</div>
                <div class="d-none d-sm-block">
                  <strong class="profile-email">{{ authService.currentUser()?.email }}</strong>
                  <span class="profile-label">My Account</span>
                </div>
                <i class="fa-solid fa-chevron-right profile-arrow"></i>
              </a>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="dash-search">
            <div class="search-inner">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                class="search-input"
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
                placeholder="Search events by name, artist, or venue..." />
              <button class="btn btn-primary" (click)="onSearch()">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- CATEGORIES -->
      @if (categories().length > 0) {
        <section class="dash-section" style="background:var(--bg-surface-alt);border-bottom:1px solid var(--border-subtle)">
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">Browse by Category</h2>
              <a routerLink="/events" class="btn btn-secondary btn-sm">View All</a>
            </div>
            <div class="cat-grid">
              @for (cat of categories(); track cat.id) {
                <button class="cat-card" (click)="filterByCategory(cat.id)">
                  <div class="cat-icon">
                    <i [class]="getCategoryIcon(cat.name)"></i>
                  </div>
                  <strong class="cat-name">{{ cat.name }}</strong>
                  <small class="cat-browse">Browse</small>
                </button>
              }
            </div>
          </div>
        </section>
      }

      <!-- UPCOMING EVENTS -->
      <section class="dash-section">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="section-label mb-1">Happening Soon</div>
              <h2 class="section-title">Upcoming Events</h2>
            </div>
            <a routerLink="/events" class="btn btn-secondary btn-sm">
              All Events <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
          @if (loading()) {
            <app-loading message="Loading events..."></app-loading>
          } @else if (upcomingEvents().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="fa-regular fa-calendar"></i></div>
              <p class="empty-title">No upcoming events</p>
              <p class="empty-text">Check back soon for new events.</p>
            </div>
          } @else {
            <div class="grid grid-cols-3 gap-4">
              @for (ev of upcomingEvents(); track ev.id) {
                <app-event-card [event]="ev"></app-event-card>
              }
            </div>
          }
        </div>
      </section>

      <!-- POPULAR EVENTS -->
      @if (popularEvents().length > 0) {
        <section class="dash-section" style="background:var(--bg-surface-alt);border-top:1px solid var(--border-subtle)">
          <div class="container">
            <div class="section-header">
              <div>
                <div class="section-label mb-1" style="color:var(--warning)"><i class="fa-solid fa-fire me-1"></i>Popular</div>
                <h2 class="section-title">Top Rated Events</h2>
              </div>
              <a routerLink="/events" class="btn btn-secondary btn-sm">
                View All <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
            <div class="grid grid-cols-3 gap-4">
              @for (ev of popularEvents(); track ev.id) {
                <app-event-card [event]="ev"></app-event-card>
              }
            </div>
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .ep-dashboard { overflow-x: hidden; }

    /* Hero */
    .dash-hero {
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-subtle);
      padding: 2.5rem 0 1.5rem;
    }
    .dash-hero-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .dash-title { font-size: 2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.25rem; letter-spacing: -0.5px; }
    .dash-sub { font-size: 0.9rem; color: var(--text-muted); }

    /* User chip */
    .dash-user-chip { display: flex; align-items: center; gap: 0.75rem; }
    .notif-btn {
      width: 38px; height: 38px;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; color: var(--text-muted);
      text-decoration: none; transition: all 0.15s;
    }
    .notif-btn:hover { color: var(--primary); border-color: var(--primary-subtle); }
    .notif-count {
      position: absolute; top: -4px; right: -4px;
      background: var(--danger); color: #fff;
      font-size: 0.65rem; font-weight: 700;
      min-width: 16px; height: 16px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 3px; border: 2px solid #fff;
    }
    .profile-chip {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.35rem 0.875rem 0.35rem 0.4rem;
      background: var(--bg-surface-alt);
      border: 1px solid var(--border-subtle);
      border-radius: 99px;
      text-decoration: none;
      transition: all 0.15s;
    }
    .profile-chip:hover { border-color: var(--primary-subtle); }
    .profile-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--primary); color: #fff;
      font-size: 0.85rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .profile-email { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-main); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .profile-label { font-size: 0.7rem; color: var(--text-muted); }
    .profile-arrow { font-size: 0.7rem; color: var(--text-dim); }

    /* Search */
    .dash-search { max-width: 700px; }
    .search-inner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #FFFFFF;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      padding: 0.4rem 0.4rem 0.4rem 1rem;
      box-shadow: var(--shadow-sm);
    }
    .search-inner:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
    .search-icon { color: var(--text-dim); font-size: 0.95rem; flex-shrink: 0; }
    .search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 0.9rem;
      font-family: var(--font-body);
      color: var(--text-main);
      background: transparent;
    }
    .search-input::placeholder { color: var(--text-dim); }

    /* Sections */
    .dash-section { padding: 2.5rem 0; }
    .section-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); }

    /* Category grid */
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 0.75rem;
    }
    @media (max-width: 1024px) { .cat-grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 640px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
    .cat-card {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1rem 0.75rem;
      text-align: center;
      cursor: pointer;
      display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
      transition: all 0.15s ease;
      box-shadow: var(--shadow-xs);
      font-family: var(--font-body);
    }
    .cat-card:hover { border-color: var(--primary); background: var(--primary-light); transform: translateY(-2px); }
    .cat-icon {
      width: 40px; height: 40px;
      background: var(--primary-light); color: var(--primary);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; margin-bottom: 0.2rem;
    }
    .cat-name { font-size: 0.85rem; font-weight: 700; color: var(--text-main); }
    .cat-browse { font-size: 0.72rem; color: var(--text-dim); }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  categories = signal<EventCategory[]>([]);
  upcomingEvents = signal<EventDto[]>([]);
  popularEvents = signal<EventDto[]>([]);
  loading = signal<boolean>(true);
  searchQuery: string = '';

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: () => this.categories.set([])
    });

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.upcomingEvents.set(events.slice(0, 3));
        this.popularEvents.set(events.slice(3, 6));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getCategoryIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('music') || lower.includes('concert')) return 'fa-solid fa-music';
    if (lower.includes('sport') || lower.includes('match')) return 'fa-solid fa-futbol';
    if (lower.includes('theatre') || lower.includes('drama') || lower.includes('arts')) return 'fa-solid fa-masks-theater';
    if (lower.includes('tech') || lower.includes('conference')) return 'fa-solid fa-laptop-code';
    if (lower.includes('food') || lower.includes('festival')) return 'fa-solid fa-utensils';
    return 'fa-solid fa-calendar-star';
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/events'], { queryParams: { search: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/events']);
    }
  }

  filterByCategory(categoryId: number): void {
    this.router.navigate(['/events'], { queryParams: { categoryId } });
  }
}
