import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventDto } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card premium-event-card d-flex flex-column justify-content-between h-100 p-0 overflow-hidden">
      <div class="card-top-content">
        <!-- Media Container (16:9 aspect, subtle vignette overlay) -->
        <div class="card-media-wrapper position-relative">
          <img
            [src]="getImageUrl()"
            [alt]="event.title"
            class="card-img"
            loading="lazy"
            (error)="onImageError($event)" />
          <div class="media-overlay"></div>

          <!-- Glowing Category Chip -->
          <div class="category-chip">
            <span class="badge-cat-glow">{{ event.categoryName || 'Live Experience' }}</span>
          </div>

          <!-- Status Badge -->
          @if (event.status) {
            <div class="status-chip">
              <span class="badge-status-glow">{{ event.status }}</span>
            </div>
          }
        </div>

        <div class="card-body-content p-4 pb-2">
          <!-- Date & Time Row -->
          <div class="event-schedule d-flex align-items-center gap-2 mb-2">
            <span class="schedule-date">
              <i class="fa-regular fa-calendar-check icon-accent me-1"></i>
              {{ event.eventDate | date:'mediumDate' }}
            </span>
            <span class="schedule-dot">&bull;</span>
            <span class="schedule-time">
              <i class="fa-regular fa-clock me-1"></i>
              {{ event.eventDate | date:'shortTime' }}
            </span>
          </div>

          <!-- Event Title -->
          <h3 class="event-title mb-2">
            <a [routerLink]="['/events', event.id]" class="title-link">{{ event.title }}</a>
          </h3>

          <!-- Description (2-line clamp) -->
          <p class="event-desc mb-3">
            {{ event.description || 'Experience exceptional live entertainment with guaranteed seats and synchronized parking reservation.' }}
          </p>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="card-footer-content p-4 pt-3 border-top border-subtle">
        <div class="venue-location mb-3 d-flex align-items-center gap-2 text-truncate">
          <i class="fa-solid fa-location-dot venue-icon"></i>
          <span class="venue-text text-truncate">{{ event.venueName || 'Main Arena Hall' }}</span>
        </div>

        <div class="d-flex align-items-center justify-content-between">
          <div class="seats-counter">
            <span class="seats-label d-block">Available</span>
            <strong class="seats-count">{{ event.capacity }} Seats</strong>
          </div>

          <a [routerLink]="['/events', event.id]" class="btn-book-now" [attr.aria-label]="'Book tickets for ' + event.title">
            <span>Book Now</span>
            <i class="fa-solid fa-arrow-right arrow-icon"></i>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .premium-event-card {
      border: 1px solid var(--border-subtle);
      background-color: var(--bg-card);
      border-radius: 22px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .premium-event-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 48px -10px rgba(0, 0, 0, 0.65), 0 0 30px rgba(108, 124, 255, 0.18);
      border-color: rgba(108, 124, 255, 0.45);
    }

    .card-media-wrapper {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
      background: var(--bg-surface);
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .premium-event-card:hover .card-img {
      transform: scale(1.06);
    }

    .media-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 21, 37, 0.05) 0%, rgba(7, 21, 37, 0.7) 100%);
      pointer-events: none;
    }

    .category-chip {
      position: absolute;
      top: 14px;
      left: 14px;
      z-index: 2;
    }

    .badge-cat-glow {
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-pill);
      background: linear-gradient(135deg, rgba(108, 124, 255, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%);
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      box-shadow: 0 4px 14px rgba(108, 124, 255, 0.35);
      display: inline-block;
    }

    .status-chip {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 2;
    }

    .badge-status-glow {
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-pill);
      background: rgba(7, 21, 37, 0.85);
      border: 1px solid rgba(245, 158, 11, 0.45);
      color: #FBBF24;
      font-size: 0.72rem;
      font-weight: 600;
      display: inline-block;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .event-schedule {
      font-size: 0.825rem;
      font-weight: 600;
    }

    .schedule-date {
      color: #22D3EE;
    }

    [data-theme="light"] .schedule-date {
      color: var(--primary);
    }

    .icon-accent {
      color: #22D3EE;
    }

    [data-theme="light"] .icon-accent {
      color: var(--primary);
    }

    .schedule-dot {
      color: var(--text-dim);
    }

    .schedule-time {
      color: var(--text-muted);
      font-weight: 500;
    }

    .event-title {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.35;
      color: var(--text-main);
    }

    .title-link {
      color: var(--text-main);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .title-link:hover {
      color: var(--primary);
    }

    .event-desc {
      font-size: 0.885rem;
      line-height: 1.55;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      color: var(--text-muted);
    }

    .card-footer-content {
      background: rgba(255, 255, 255, 0.02);
    }

    .venue-location {
      font-size: 0.835rem;
      color: var(--text-muted);
    }

    .venue-icon {
      color: #6C7CFF;
      font-size: 0.85rem;
    }

    .venue-text {
      font-weight: 500;
    }

    .seats-counter .seats-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-dim);
      font-weight: 600;
    }

    .seats-counter .seats-count {
      font-size: 0.95rem;
      color: var(--text-main);
      font-weight: 700;
    }

    .btn-book-now {
      background: linear-gradient(135deg, #6C7CFF 0%, #A855F7 100%);
      color: #FFFFFF !important;
      border-radius: var(--radius-btn);
      font-weight: 700;
      font-size: 0.885rem;
      padding: 0.65rem 1.25rem;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      border: none;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 14px rgba(108, 124, 255, 0.35);
      cursor: pointer;
      text-decoration: none;
    }

    .btn-book-now:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(108, 124, 255, 0.5);
    }

    .btn-book-now .arrow-icon {
      transition: transform var(--transition-fast);
      font-size: 0.8rem;
    }

    .premium-event-card:hover .btn-book-now .arrow-icon,
    .btn-book-now:hover .arrow-icon {
      transform: translateX(4px);
    }
  `]
})
export class EventCardComponent {
  @Input({ required: true }) event!: EventDto;

  getImageUrl(): string {
    if (this.event.imageUrl && this.event.imageUrl.trim().length > 5) {
      return this.event.imageUrl;
    }

    const category = (this.event.categoryName || '').toLowerCase();
    const title = (this.event.title || '').toLowerCase();

    if (category.includes('music') || category.includes('concert') || title.includes('music') || title.includes('symphony') || title.includes('tour')) {
      return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('sport') || category.includes('league') || title.includes('match') || title.includes('cup') || title.includes('championship')) {
      return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('theatre') || category.includes('art') || title.includes('theatre') || title.includes('drama') || title.includes('comedy')) {
      return 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('tech') || category.includes('conference') || title.includes('tech') || title.includes('summit') || title.includes('expo')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
    }

    const fallbacks = [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80'
    ];
    return fallbacks[(this.event.id || 0) % fallbacks.length];
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80';
  }
}
