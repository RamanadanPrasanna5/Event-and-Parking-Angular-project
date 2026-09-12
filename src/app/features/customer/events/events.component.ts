import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { VenueService } from '../../../core/services/venue.service';
import { CategoryService } from '../../../core/services/category.service';
import { EventDto } from '../../../core/models/event.model';
import { Venue } from '../../../core/models/venue.model';
import { EventCategory } from '../../../core/models/category.model';
import { EventCardComponent } from '../../events/event-card/event-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-events, app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EventCardComponent,
    LoadingComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="ep-events-page">
      <!-- Page Header -->
      <div class="events-page-header">
        <div class="container">
          <div class="events-header-inner">
            <div>
              <div class="section-label mb-1">Live Catalogue</div>
              <h1 class="page-title mb-1">Discover Events</h1>
              <p class="text-muted">Browse concerts, sports, conferences and festivals with real-time seat and parking reservations.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="container py-4">
        <div class="card filter-bar-card p-3 p-md-4 mb-4">
          <div class="row d-flex flex-wrap gap-3 align-items-end">
            <!-- Search Text -->
            <div class="filter-col flex-grow-1" style="min-width: 220px;">
              <label class="form-label" for="search">Search</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-magnifying-glass input-icon"></i>
                <input
                  id="search"
                  type="text"
                  class="form-control"
                  [(ngModel)]="search"
                  (keyup.enter)="applyFilters()"
                  placeholder="Search by event title, artist or venue..." />
              </div>
            </div>

            <!-- Category Select -->
            <div class="filter-col" style="min-width: 160px;">
              <label class="form-label" for="category">Category</label>
              <select id="category" class="form-select" [(ngModel)]="selectedCategoryId" (change)="applyFilters()">
                <option [ngValue]="undefined">All Categories</option>
                @for (category of categories(); track category.id) {
                  <option [ngValue]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>

            <!-- Venue Select -->
            <div class="filter-col" style="min-width: 170px;">
              <label class="form-label" for="venue">Venue</label>
              <select id="venue" class="form-select" [(ngModel)]="selectedVenueId" (change)="applyFilters()">
                <option [ngValue]="undefined">All Venues</option>
                @for (venue of venues(); track venue.id) {
                  <option [ngValue]="venue.id">{{ venue.name }}</option>
                }
              </select>
            </div>

            <!-- Date Picker -->
            <div class="filter-col" style="min-width: 150px;">
              <label class="form-label" for="eventDate">Date</label>
              <input
                id="eventDate"
                type="date"
                class="form-control"
                [(ngModel)]="selectedDate"
                (change)="applyFilters()" />
            </div>

            <!-- Price Filter -->
            <div class="filter-col" style="min-width: 150px;">
              <label class="form-label" for="priceRange">Max Price</label>
              <select id="priceRange" class="form-select" [(ngModel)]="selectedMaxPrice" (change)="applyFilters()">
                <option [ngValue]="undefined">Any Price</option>
                <option [ngValue]="3000">Up to LKR 3,000</option>
                <option [ngValue]="5000">Up to LKR 5,000</option>
                <option [ngValue]="10000">Up to LKR 10,000</option>
              </select>
            </div>

            <!-- Filter Action Buttons -->
            <div class="d-flex gap-2 filter-col-btn">
              <button class="btn btn-primary" (click)="applyFilters()">
                <i class="fa-solid fa-filter me-1"></i> Filter
              </button>
              @if (hasActiveFilters()) {
                <button class="btn btn-secondary" (click)="resetFilters()" title="Reset all filters">
                  <i class="fa-solid fa-rotate-left"></i> Reset
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Events List States -->
        @if (loading()) {
          <app-loading message="Discovering events..."></app-loading>
        } @else if (events().length === 0) {
          <app-empty-state
            icon="fa-regular fa-calendar-xmark"
            title="No Events Found"
            message="No events match your selected filters. Try broadening your keywords or resetting filters."
            actionLabel="Clear All Filters"
            (actionClicked)="resetFilters()">
          </app-empty-state>
        } @else {
          <div class="d-flex justify-content-between align-items-center mb-3">
            <small class="text-muted">Showing <strong>{{ events().length }}</strong> events available for reservation</small>
          </div>

          <div class="grid grid-cols-3 gap-4">
            @for (ev of events(); track ev.id) {
              <app-event-card [event]="ev"></app-event-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .ep-events-page { overflow-x: hidden; }

    .events-page-header {
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-subtle);
      padding: 2.5rem 0;
    }
    .events-header-inner {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .section-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }

    .filter-bar-card {
      border: 1px solid var(--border-subtle);
      background: #FFFFFF;
      box-shadow: var(--shadow-xs);
      border-radius: var(--radius-lg);
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 0.875rem;
      color: var(--text-dim);
      font-size: 0.875rem;
      pointer-events: none;
    }
    .input-with-icon input { padding-left: 2.375rem; }
    .filter-col-btn { align-self: flex-end; }
  `]
})
export class EventsComponent implements OnInit {
  private eventService = inject(EventService);
  private venueService = inject(VenueService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  events = signal<EventDto[]>([]);
  venues = signal<Venue[]>([]);
  categories = signal<EventCategory[]>([]);
  loading = signal<boolean>(true);

  search: string = '';
  selectedVenueId?: number;
  selectedCategoryId?: number;
  selectedDate?: string;
  selectedMaxPrice?: number;

  ngOnInit(): void {
    this.loadFilterOptions();

    this.route.queryParams.subscribe(params => {
      this.search = params['search'] || '';
      this.selectedVenueId = params['venueId'] ? parseInt(params['venueId'], 10) : undefined;
      this.selectedCategoryId = params['categoryId'] ? parseInt(params['categoryId'], 10) : undefined;
      this.selectedDate = params['date'] || undefined;
      this.selectedMaxPrice = params['maxPrice'] ? parseInt(params['maxPrice'], 10) : undefined;

      this.loadEvents();
    });
  }

  loadFilterOptions(): void {
    this.venueService.getVenues().subscribe({
      next: v => this.venues.set(v || []),
      error: () => this.venues.set([])
    });
    this.categoryService.getCategories().subscribe({
      next: c => this.categories.set(c || []),
      error: () => this.categories.set([])
    });
  }

  loadEvents(): void {
    this.loading.set(true);

    this.eventService.getEvents({
      search: this.search || undefined,
      venueId: this.selectedVenueId,
      categoryId: this.selectedCategoryId,
      date: this.selectedDate || undefined,
      maxPrice: this.selectedMaxPrice
    }).subscribe({
      next: data => {
        this.events.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    const queryParams: any = {};
    if (this.search) queryParams.search = this.search;
    if (this.selectedVenueId) queryParams.venueId = this.selectedVenueId;
    if (this.selectedCategoryId) queryParams.categoryId = this.selectedCategoryId;
    if (this.selectedDate) queryParams.date = this.selectedDate;
    if (this.selectedMaxPrice) queryParams.maxPrice = this.selectedMaxPrice;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams
    });
  }

  resetFilters(): void {
    this.search = '';
    this.selectedVenueId = undefined;
    this.selectedCategoryId = undefined;
    this.selectedDate = undefined;
    this.selectedMaxPrice = undefined;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.search || this.selectedVenueId || this.selectedCategoryId || this.selectedDate || this.selectedMaxPrice);
  }
}

export const EventListComponent = EventsComponent;
export type EventListComponent = EventsComponent;
