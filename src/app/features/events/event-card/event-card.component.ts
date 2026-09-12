import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventDto } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="ep-event-card">
      <!-- Image -->
      <div class="card-img-wrap">
        <img
          [src]="getImageUrl()"
          [alt]="event.title"
          class="card-img"
          (error)="onImageError($event)" />
        <div class="img-overlay"></div>

        <!-- Badges -->
        <div class="card-badges">
          <span class="badge badge-primary">{{ event.categoryName || 'Live Event' }}</span>
        </div>
        <div class="card-status">
          <span class="badge badge-success">{{ event.status || 'Available' }}</span>
        </div>
      </div>

      <!-- Body -->
      <div class="card-body">
        <!-- Date & Time -->
        <div class="ev-meta mb-2">
          <span class="ev-date">
            <i class="fa-regular fa-calendar"></i>
            {{ event.eventDate | date:'MMM d, y' }}
          </span>
          <span class="ev-sep">·</span>
          <span class="ev-time">
            <i class="fa-regular fa-clock"></i>
            {{ event.startTime || (event.eventDate | date:'h:mm a') }}
          </span>
        </div>

        <!-- Title -->
        <h3 class="ev-title mb-2">
          <a [routerLink]="['/events', event.id]" class="ev-title-link">{{ event.title }}</a>
        </h3>

        <!-- Description -->
        <p class="ev-desc mb-3">
          {{ event.description || 'Join this live event with reserved auditorium seating and dedicated vehicle parking.' }}
        </p>

        <!-- Footer -->
        <div class="card-footer-row">
          <div class="ev-venue">
            <i class="fa-solid fa-location-dot"></i>
            <span>{{ event.venueName }}</span>
          </div>
          <div class="ev-capacity">
            <i class="fa-solid fa-users"></i>
            <span>{{ event.capacity | number }} seats</span>
          </div>
        </div>

        <!-- Action -->
        <div class="card-actions">
          <a [routerLink]="['/events', event.id]" class="btn btn-outline btn-sm flex-grow-1">
            View Details
          </a>
          <a [routerLink]="['/booking/seats', event.id]" class="btn btn-primary btn-sm flex-grow-1">
            Book Now
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ep-event-card {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      box-shadow: var(--shadow-xs);
      height: 100%;
    }
    .ep-event-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-medium);
    }

    /* Image */
    .card-img-wrap {
      position: relative;
      height: 196px;
      overflow: hidden;
      background: var(--bg-surface-alt);
      flex-shrink: 0;
    }
    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
    }
    .ep-event-card:hover .card-img { transform: scale(1.04); }
    .img-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0.3) 100%);
    }
    .card-badges { position: absolute; top: 10px; left: 10px; z-index: 1; }
    .card-status { position: absolute; top: 10px; right: 10px; z-index: 1; }

    /* Body */
    .card-body {
      padding: 1.125rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    /* Meta */
    .ev-meta {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
    }
    .ev-date { color: var(--primary); font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
    .ev-sep { color: var(--text-dim); }
    .ev-time { color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }

    /* Title */
    .ev-title { font-size: 1.05rem; font-weight: 700; line-height: 1.35; }
    .ev-title-link { color: var(--text-main); text-decoration: none; transition: color 0.12s; }
    .ev-title-link:hover { color: var(--primary); }

    /* Desc */
    .ev-desc {
      font-size: 0.825rem;
      color: var(--text-muted);
      line-height: 1.55;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }

    /* Footer */
    .card-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-top: 1px solid var(--border-subtle);
      margin-bottom: 0.75rem;
    }
    .ev-venue, .ev-capacity {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .ev-venue i { color: var(--primary); }
    .ev-venue span { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Actions */
    .card-actions {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class EventCardComponent {
  @Input({ required: true }) event!: EventDto;

  getImageUrl(): string {
    if (this.event.imageUrl && this.event.imageUrl.trim().length > 5) {
      return this.event.imageUrl;
    }
    if (this.event.image && this.event.image.trim().length > 5) {
      return this.event.image;
    }
    return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80';
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80';
  }
}
