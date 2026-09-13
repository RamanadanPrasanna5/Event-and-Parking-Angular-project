import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { VenueService } from '../../../core/services/venue.service';
import { CategoryService } from '../../../core/services/category.service';
import { EventDto } from '../../../core/models/event.model';
import { Venue } from '../../../core/models/venue.model';
import { EventCategory } from '../../../core/models/category.model';
import { EventCardComponent } from '../../events/event-card/event-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-events, app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    EventCardComponent,
    LoadingComponent,
    EmptyStateComponent,
    ErrorBannerComponent
  ],
  template: `
    <div class="events-page-wrapper">
      <!-- Background Creative Blurred Gradient Blobs -->
      <div class="editorial-blobs-layer" aria-hidden="true">
        <div class="gradient-blob blob-blue"></div>
        <div class="gradient-blob blob-purple"></div>
        <div class="gradient-blob blob-cyan"></div>
      </div>

      <!-- Graphic Plus Symbol Accents -->
      <div class="decor-plus decor-plus-1" aria-hidden="true">+</div>
      <div class="decor-plus decor-plus-2" aria-hidden="true">+</div>
      <div class="decor-plus decor-plus-3" aria-hidden="true">+</div>
      <div class="decor-plus decor-plus-4" aria-hidden="true">+</div>
      <div class="decor-plus decor-plus-5" aria-hidden="true">+</div>

      <!-- ============================================================
           1. CREATIVE EDITORIAL HERO SECTION (CINEMATIC FULL VIEWPORT)
           ============================================================ -->
      <section class="events-editorial-hero position-relative hero-z-index">
        <div class="container hero-inner-container w-100">
          <div class="row align-items-center g-5">
            <!-- Left: High-Impact Typography & Narrative -->
            <div class="col-lg-6 hero-text-col">
              <div class="hero-eyebrow-chip mb-3">
                <span class="pulsing-cyan-dot"></span>
                <span>CURATED LIVE STAGES & EXPERIENCES</span>
              </div>

              <h1 class="hero-huge-heading mb-4">
                Discover Events <br />
                <span class="gradient-text-hero">Worth Remembering.</span>
              </h1>

              <p class="hero-editorial-lead mb-4">
                Browse world-class arena concerts, tech summits, championship esports, and theatrical spectacles.
                Synchronized interactive seat selection and guaranteed venue parking in one seamless flow.
              </p>

              <div class="hero-cta-group d-flex flex-wrap align-items-center gap-3 mb-5">
                <button
                  type="button"
                  class="btn btn-primary btn-hero-explore"
                  (click)="scrollToCatalogue()"
                  aria-label="Scroll to Upcoming Events Catalogue">
                  <i class="fa-solid fa-compass me-2"></i>
                  <span>Explore Catalogue</span>
                  <i class="fa-solid fa-arrow-down ms-2 explore-arrow"></i>
                </button>

                <a
                  routerLink="/reservations/my-reservations"
                  class="btn btn-secondary btn-hero-pass">
                  <i class="fa-solid fa-ticket me-2"></i>
                  <span>My Passes</span>
                </a>
              </div>

              <!-- Hero Quick Stats / Trust Indicators -->
              <div class="hero-metrics-strip">
                <div class="metric-item">
                  <span class="metric-num">150+</span>
                  <span class="metric-label">Live Shows</span>
                </div>
                <div class="metric-divider"></div>
                <div class="metric-item">
                  <span class="metric-num">100%</span>
                  <span class="metric-label">Guaranteed Bays</span>
                </div>
                <div class="metric-divider"></div>
                <div class="metric-item">
                  <span class="metric-num">15 Min</span>
                  <span class="metric-label">Hold Security</span>
                </div>
              </div>
            </div>

            <!-- Right: Asymmetric Floating Event Preview Cards Showcase -->
            <div class="col-lg-6 hero-showcase-col">
              <div class="hero-cards-composition">
                <!-- Centerpiece Floating Featured Event Card -->
                <div class="floating-preview-card card-main-stage shadow-2xl">
                  <div class="preview-media">
                    <img
                      [src]="getEventImage(getHeroEvent(0), 0)"
                      [alt]="getHeroEvent(0)?.title || 'Premier Event'"
                      class="preview-img" />
                    <div class="media-vignette"></div>

                    <!-- Category Pill -->
                    <span class="preview-cat-badge">
                      {{ getHeroEvent(0)?.categoryName || 'Premier Concert' }}
                    </span>

                    <!-- Floating Live Pill -->
                    <span class="preview-live-indicator">
                      <span class="live-dot"></span> Verified Stage
                    </span>
                  </div>

                  <div class="preview-content p-4">
                    <div class="preview-schedule mb-2">
                      <i class="fa-regular fa-calendar text-cyan me-1"></i>
                      <span>{{ getHeroEvent(0)?.eventDate | date:'mediumDate' }}</span>
                      <span class="dot-separator">&bull;</span>
                      <span>{{ getHeroEvent(0)?.eventDate | date:'shortTime' }}</span>
                    </div>

                    <h3 class="preview-title mb-2 text-truncate">
                      {{ getHeroEvent(0)?.title || 'Neon Odyssey World Arena Live' }}
                    </h3>

                    <div class="preview-venue mb-3 text-truncate">
                      <i class="fa-solid fa-location-dot text-cyan me-1"></i>
                      <span>{{ getHeroEvent(0)?.venueName || 'Grand Horizon Amphitheater' }}</span>
                    </div>

                    <div class="preview-footer d-flex justify-content-between align-items-center pt-3 border-top border-subtle">
                      <div class="preview-capacity">
                        <span class="cap-label">Capacity</span>
                        <strong class="cap-val">{{ getHeroEvent(0)?.capacity || 450 }} Seats</strong>
                      </div>

                      <a
                        [routerLink]="['/events', getHeroEvent(0)?.id || 1]"
                        class="btn-book-now"
                        [attr.aria-label]="'Book now for ' + (getHeroEvent(0)?.title || 'event')">
                        <span>Book Now</span>
                        <i class="fa-solid fa-arrow-right arrow-icon"></i>
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Secondary Floating Preview Card (Offset Top-Right) -->
                <div class="floating-preview-card card-satellite-top">
                  <div class="satellite-inner d-flex align-items-center gap-3">
                    <img
                      [src]="getEventImage(getHeroEvent(1), 1)"
                      [alt]="getHeroEvent(1)?.title || 'Tech Summit'"
                      class="satellite-thumb" />
                    <div class="satellite-details flex-grow-1 overflow-hidden">
                      <span class="satellite-chip">{{ getHeroEvent(1)?.categoryName || 'Tech Summit' }}</span>
                      <h4 class="satellite-title text-truncate">{{ getHeroEvent(1)?.title || 'Global Tech Innovators' }}</h4>
                      <div class="satellite-date">
                        <i class="fa-regular fa-calendar-check text-purple me-1"></i>
                        {{ getHeroEvent(1)?.eventDate | date:'MMM d' }}
                      </div>
                    </div>
                    <a [routerLink]="['/events', getHeroEvent(1)?.id || 2]" class="satellite-arrow-btn" aria-label="View event">
                      <i class="fa-solid fa-chevron-right"></i>
                    </a>
                  </div>
                </div>

                <!-- Tertiary Floating Badge (Offset Bottom-Left) -->
                <div class="floating-preview-card card-satellite-bottom">
                  <div class="satellite-inner d-flex align-items-center gap-3">
                    <div class="parking-bay-icon">
                      <i class="fa-solid fa-square-parking"></i>
                    </div>
                    <div class="satellite-details">
                      <span class="parking-badge-text">SYNCHRONIZED PARKING</span>
                      <h4 class="parking-subtext mb-0">Reserved Bay Included</h4>
                    </div>
                    <span class="badge-status-dot"></span>
                  </div>
                </div>

                <!-- Quaternary Accent Card (Offset Bottom-Right) -->
                <div class="floating-preview-card card-satellite-side">
                  <div class="satellite-inner d-flex align-items-center gap-3">
                    <img
                      [src]="getEventImage(getHeroEvent(2), 2)"
                      [alt]="getHeroEvent(2)?.title || 'Championship'"
                      class="satellite-thumb-sm" />
                    <div class="satellite-details flex-grow-1 overflow-hidden">
                      <span class="satellite-chip chip-magenta">{{ getHeroEvent(2)?.categoryName || 'Championship' }}</span>
                      <h4 class="satellite-title text-truncate">{{ getHeroEvent(2)?.title || 'Cyber Arena Finals' }}</h4>
                    </div>
                    <a [routerLink]="['/events', getHeroEvent(2)?.id || 3]" class="satellite-arrow-btn" aria-label="View event">
                      <i class="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           2. EVENTS DISCOVERY & FLOATING FILTER TOOLBAR SECTION
           ============================================================ -->
      <section id="catalogue-section" class="events-catalogue-section position-relative hero-z-index" aria-label="Events Catalogue">
        <div class="container py-5">
          <!-- Section Title & Narrative -->
          <div class="section-title-wrap mb-4">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="section-indicator-dot"></span>
              <span class="section-eyebrow">EXPLORE UPCOMING EXPERIENCES</span>
            </div>
            <div class="d-flex flex-wrap justify-content-between align-items-end gap-3">
              <div>
                <h2 class="section-main-heading">What's Happening Next</h2>
                <p class="section-description mb-0">
                  Select an event to explore seating tiers, reserve exact seat numbers, and lock in your parking slot.
                </p>
              </div>

              <!-- Quick Results Counter -->
              <div class="results-pill-counter">
                <span class="counter-dot"></span>
                <span><strong>{{ events().length }}</strong> Live Events Available</span>
              </div>
            </div>
          </div>

          <!-- Quick Category Filter Pills -->
          <div class="category-pills-scroll mb-4" role="tablist" aria-label="Filter events by category">
            <button
              type="button"
              class="cat-pill"
              [class.active]="selectedCategoryId === undefined"
              (click)="selectCategory(undefined)">
              <i class="fa-solid fa-border-all me-1"></i> All Events
            </button>
            @for (cat of categories(); track cat.id) {
              <button
                type="button"
                class="cat-pill"
                [class.active]="selectedCategoryId === cat.id"
                (click)="selectCategory(cat.id)">
                <i class="fa-solid fa-ticket-simple me-1"></i> {{ cat.name }}
              </button>
            }
          </div>

          <!-- Floating Glassmorphic Filter Toolbar -->
          <div class="floating-filter-toolbar p-3 p-md-4 mb-4 mb-md-5">
            <div class="filter-toolbar-grid">
              <!-- Search Keyword -->
              <div class="filter-cell search-cell">
                <label class="cell-label" for="search-input">
                  <i class="fa-solid fa-magnifying-glass icon-cyan"></i> Search Event
                </label>
                <div class="input-container">
                  <input
                    id="search-input"
                    type="text"
                    class="toolbar-input"
                    [(ngModel)]="search"
                    (keyup.enter)="applyFilters()"
                    placeholder="Search by title, artist, keyword..." />
                  @if (search) {
                    <button
                      type="button"
                      class="input-clear-btn"
                      (click)="clearSearch()"
                      aria-label="Clear search text">
                      <i class="fa-solid fa-xmark"></i>
                    </button>
                  }
                </div>
              </div>

              <!-- Venue Dropdown -->
              <div class="filter-cell">
                <label class="cell-label" for="venue-select">
                  <i class="fa-solid fa-location-dot icon-purple"></i> Venue
                </label>
                <div class="input-container">
                  <select
                    id="venue-select"
                    class="toolbar-select"
                    [(ngModel)]="selectedVenueId"
                    (change)="applyFilters()">
                    <option [ngValue]="undefined">All Venues</option>
                    @for (venue of venues(); track venue.id) {
                      <option [ngValue]="venue.id">{{ venue.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Category Dropdown -->
              <div class="filter-cell">
                <label class="cell-label" for="category-select">
                  <i class="fa-solid fa-tags icon-pink"></i> Category
                </label>
                <div class="input-container">
                  <select
                    id="category-select"
                    class="toolbar-select"
                    [(ngModel)]="selectedCategoryId"
                    (change)="applyFilters()">
                    <option [ngValue]="undefined">All Categories</option>
                    @for (cat of categories(); track cat.id) {
                      <option [ngValue]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Date Picker -->
              <div class="filter-cell">
                <label class="cell-label" for="date-picker">
                  <i class="fa-regular fa-calendar-days icon-blue"></i> Event Date
                </label>
                <div class="input-container">
                  <input
                    id="date-picker"
                    type="date"
                    class="toolbar-input date-input"
                    [(ngModel)]="selectedDate"
                    (change)="applyFilters()" />
                </div>
              </div>

              <!-- Actions: Filter Submit & Reset -->
              <div class="filter-actions-cell">
                <button
                  type="button"
                  class="btn-apply-filters"
                  (click)="applyFilters()"
                  aria-label="Apply filter parameters">
                  <i class="fa-solid fa-sliders me-2"></i>
                  <span>Filter</span>
                </button>

                @if (hasActiveFilters()) {
                  <button
                    type="button"
                    class="btn-reset-filters"
                    (click)="resetFilters()"
                    title="Reset all active filters"
                    aria-label="Reset all filters">
                    <i class="fa-solid fa-rotate-left"></i>
                  </button>
                }
              </div>
            </div>

            <!-- Active Filter Badges Strip (Visible if any filter active) -->
            @if (hasActiveFilters()) {
              <div class="active-filters-strip mt-3 pt-3 border-top border-subtle d-flex flex-wrap align-items-center gap-2">
                <span class="active-badge-label">Active Filters:</span>

                @if (search) {
                  <span class="active-filter-tag">
                    Keyword: "{{ search }}"
                    <button type="button" (click)="clearSearch()">&times;</button>
                  </span>
                }
                @if (selectedVenueId) {
                  <span class="active-filter-tag">
                    Venue: {{ getVenueName(selectedVenueId) }}
                    <button type="button" (click)="clearVenue()">&times;</button>
                  </span>
                }
                @if (selectedCategoryId) {
                  <span class="active-filter-tag">
                    Category: {{ getCategoryName(selectedCategoryId) }}
                    <button type="button" (click)="clearCategory()">&times;</button>
                  </span>
                }
                @if (selectedDate) {
                  <span class="active-filter-tag">
                    Date: {{ selectedDate }}
                    <button type="button" (click)="clearDate()">&times;</button>
                  </span>
                }

                <button type="button" class="btn-clear-all-link ms-auto" (click)="resetFilters()">
                  Clear all
                </button>
              </div>
            }
          </div>

          <!-- ============================================================
               3. EVENTS CATALOGUE GRID & FEEDBACK STATES
               ============================================================ -->
          @if (loading()) {
            <div class="py-5 text-center">
              <app-loading message="Discovering upcoming curated events..."></app-loading>
            </div>
          } @else if (error()) {
            <app-error-banner [message]="error()!" (retry)="loadEvents()"></app-error-banner>
          } @else if (events().length === 0) {
            <app-empty-state
              icon="fa-regular fa-calendar-xmark"
              title="No Upcoming Events Found"
              message="No events currently match your search criteria. Try modifying your keywords, venue selection or date filter."
              actionLabel="Reset All Filters"
              (actionClicked)="resetFilters()">
            </app-empty-state>
          } @else {
            <!-- Dynamic Event Cards Responsive Grid (3 Desktop, 2 Tablet, 1 Mobile) -->
            <div class="editorial-events-grid">
              @for (ev of events(); track ev.id; let idx = $index) {
                <div class="event-grid-item" [style.animation-delay]="(idx * 60) + 'ms'">
                  <app-event-card [event]="ev"></app-event-card>
                </div>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    /* ==========================================================
       CONTAINER & CANVAS WRAPPER
       ========================================================== */
    .events-page-wrapper {
      position: relative;
      min-height: calc(100vh - 140px);
      background-color: var(--bg-main);
      color: var(--text-main);
      overflow-x: hidden;
    }

    .hero-z-index {
      z-index: 2;
    }

    /* ==========================================================
       ORGANIC BACKGROUND GRADIENT BLOBS (BLURRED & ANIMATED)
       ========================================================== */
    .editorial-blobs-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    }

    .gradient-blob {
      position: absolute;
      border-radius: 50%;
      opacity: 0.65;
      mix-blend-mode: screen;
      pointer-events: none;
    }

    [data-theme="light"] .gradient-blob {
      opacity: 0.25;
      mix-blend-mode: multiply;
    }

    .blob-blue {
      top: -120px;
      left: -100px;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(108, 124, 255, 0.42) 0%, rgba(108, 124, 255, 0) 70%);
      filter: blur(80px);
      animation: floatBlobSlow 20s ease-in-out infinite;
    }

    .blob-purple {
      top: 150px;
      right: -80px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.38) 0%, rgba(236, 72, 153, 0.22) 50%, rgba(168, 85, 247, 0) 70%);
      filter: blur(85px);
      animation: floatBlobSlow 24s ease-in-out infinite reverse;
    }

    .blob-cyan {
      top: 600px;
      left: 20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, rgba(34, 211, 238, 0) 70%);
      filter: blur(75px);
      animation: floatBlobSlow 18s ease-in-out infinite;
    }

    /* ==========================================================
       SCATTERED GRAPHIC "+" SYMBOL ACCENTS
       ========================================================== */
    .decor-plus {
      position: absolute;
      color: #6C7CFF;
      font-size: 1.35rem;
      font-weight: 300;
      font-family: monospace;
      line-height: 1;
      pointer-events: none;
      z-index: 1;
      animation: pulsePlusSymbol 5s ease-in-out infinite;
    }

    .decor-plus-1 { top: 70px; left: 8%; animation-delay: 0s; }
    .decor-plus-2 { top: 120px; left: 46%; color: #A855F7; animation-delay: 1.5s; font-size: 1.6rem; }
    .decor-plus-3 { top: 400px; left: 3%; color: #22D3EE; animation-delay: 2.8s; font-size: 1.1rem; }
    .decor-plus-4 { top: 220px; right: 5%; color: #EC4899; animation-delay: 0.8s; font-size: 1.4rem; }
    .decor-plus-5 { top: 580px; right: 28%; color: #6C7CFF; animation-delay: 3.5s; font-size: 1.2rem; }

    /* ==========================================================
       HERO SECTION: TYPOGRAPHY & ASYMMETRIC COMPOSITION
       ========================================================== */
    .events-editorial-hero {
      position: relative;
      height: calc(100vh - 72px);
      min-height: calc(100vh - 72px);
      max-height: calc(100vh - 72px);
      width: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }

    .hero-inner-container {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    .hero-eyebrow-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.95rem;
      border-radius: var(--radius-pill);
      background: rgba(34, 211, 238, 0.10);
      border: 1px solid rgba(34, 211, 238, 0.35);
      color: #22D3EE;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 0.6rem !important;
    }

    .pulsing-cyan-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22D3EE;
      box-shadow: 0 0 10px #22D3EE;
      animation: pulseDot 2s ease-in-out infinite;
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 0.6; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.3); }
    }

    .hero-huge-heading {
      font-family: var(--font-heading);
      font-size: clamp(2.1rem, 3.8vw, 3.4rem);
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: var(--text-main);
      margin-bottom: 0.75rem !important;
    }

    .hero-editorial-lead {
      font-size: clamp(0.92rem, 1.25vw, 1.05rem);
      line-height: 1.55;
      color: var(--text-muted);
      max-width: 520px;
      margin-bottom: 1.1rem !important;
    }

    .hero-cta-group {
      margin-bottom: 1.1rem !important;
    }

    .btn-hero-explore {
      padding: 0.75rem 1.6rem;
      font-size: 0.95rem;
      font-weight: 700;
      border-radius: var(--radius-btn);
      display: inline-flex;
      align-items: center;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-primary);
      cursor: pointer;
    }

    .btn-hero-explore:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px var(--primary-glow);
    }

    .btn-hero-explore:hover .explore-arrow {
      transform: translateY(3px);
    }

    .explore-arrow {
      transition: transform var(--transition-fast);
    }

    .btn-hero-pass {
      padding: 0.75rem 1.4rem;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: var(--radius-btn);
      display: inline-flex;
      align-items: center;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .hero-metrics-strip {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      padding: 0.55rem 1.1rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      width: -webkit-fit-content;
      width: -moz-fit-content;
      width: fit-content;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .metric-item {
      display: flex;
      flex-direction: column;
    }

    .metric-num {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.2;
    }

    .metric-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.03em;
    }

    .metric-divider {
      width: 1px;
      height: 28px;
      background: var(--border-subtle);
    }

    /* ==========================================================
       HERO SHOWCASE: ASYMMETRIC FLOATING CARDS COMPOSITION
       ========================================================== */
    .hero-cards-composition {
      position: relative;
      height: 420px;
      max-height: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1000px;
    }

    .floating-preview-card {
      position: relative;
      background: var(--bg-glass-heavy);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-card);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Centerpiece Featured Stage Card */
    .card-main-stage {
      width: 100%;
      max-width: 340px;
      overflow: hidden;
      transform: rotate(-2deg);
      z-index: 3;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55), 0 0 30px rgba(108, 124, 255, 0.15);
    }

    .card-main-stage:hover {
      transform: rotate(0deg) translateY(-4px) scale(1.02);
      border-color: rgba(108, 124, 255, 0.45);
      box-shadow: 0 26px 65px rgba(0, 0, 0, 0.65), 0 0 45px rgba(108, 124, 255, 0.3);
    }

    .preview-media {
      position: relative;
      height: 175px;
      overflow: hidden;
      background: var(--bg-surface);
    }

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .card-main-stage:hover .preview-img {
      transform: scale(1.06);
    }

    .media-vignette {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 21, 37, 0.1) 0%, rgba(7, 21, 37, 0.8) 100%);
      pointer-events: none;
    }

    .preview-cat-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-pill);
      background: linear-gradient(135deg, rgba(108, 124, 255, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%);
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .preview-live-indicator {
      position: absolute;
      top: 14px;
      right: 14px;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-pill);
      background: rgba(7, 21, 37, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #F8FAFC;
      font-size: 0.72rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    .preview-content {
      padding: 0.9rem 1.15rem !important;
    }

    .preview-schedule {
      font-size: 0.825rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .dot-separator {
      margin: 0 0.45rem;
      color: var(--text-dim);
    }

    .preview-title {
      font-family: var(--font-heading);
      font-size: 1.12rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.3;
      margin-bottom: 0.35rem !important;
    }

    .preview-venue {
      font-size: 0.825rem;
      color: var(--text-muted);
      margin-bottom: 0.6rem !important;
    }

    .preview-capacity .cap-label {
      display: block;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-dim);
      font-weight: 600;
    }

    .preview-capacity .cap-val {
      font-size: 0.95rem;
      color: var(--text-main);
      font-weight: 700;
    }

    /* Top-Right Offset Satellite Card */
    .card-satellite-top {
      position: absolute;
      top: 10px;
      right: -25px;
      width: 290px;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-lg);
      transform: rotate(4deg);
      z-index: 4;
      animation: floatCardGentle 6s ease-in-out infinite;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
    }

    .satellite-thumb {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      object-fit: cover;
      flex-shrink: 0;
    }

    .satellite-thumb-sm {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      flex-shrink: 0;
    }

    .satellite-chip {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #A855F7;
    }

    .chip-magenta {
      color: #EC4899;
    }

    .satellite-title {
      font-size: 0.885rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0.15rem 0;
      line-height: 1.3;
    }

    .satellite-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .satellite-arrow-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      transition: all var(--transition-fast);
      text-decoration: none;
      flex-shrink: 0;
    }

    .satellite-arrow-btn:hover {
      background: var(--primary);
      color: #FFFFFF;
      transform: scale(1.1);
    }

    /* Bottom-Left Offset Floating Bay Indicator */
    .card-satellite-bottom {
      position: absolute;
      bottom: 20px;
      left: -25px;
      padding: 0.75rem 1.1rem;
      border-radius: var(--radius-lg);
      transform: rotate(-3deg);
      z-index: 4;
      animation: floatCardGentle 7s ease-in-out infinite reverse;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
    }

    .parking-bay-icon {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: rgba(34, 211, 238, 0.15);
      border: 1px solid rgba(34, 211, 238, 0.35);
      color: #22D3EE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .parking-badge-text {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #22D3EE;
      text-transform: uppercase;
      display: block;
    }

    .parking-subtext {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .badge-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
      flex-shrink: 0;
    }

    /* Offset Bottom-Right Accent Card */
    .card-satellite-side {
      position: absolute;
      bottom: -15px;
      right: -10px;
      width: 260px;
      padding: 0.75rem 0.95rem;
      border-radius: var(--radius-lg);
      transform: rotate(2.5deg);
      z-index: 5;
      animation: floatCardGentle 8s ease-in-out infinite;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
    }

    @media (max-height: 740px) {
      .hero-huge-heading {
        font-size: 2rem !important;
        margin-bottom: 0.5rem !important;
      }
      .hero-editorial-lead {
        font-size: 0.88rem !important;
        margin-bottom: 0.75rem !important;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .hero-cta-group {
        margin-bottom: 0.75rem !important;
      }
      .hero-metrics-strip {
        padding: 0.4rem 0.75rem !important;
        gap: 0.8rem !important;
      }
      .hero-cards-composition {
        height: 360px !important;
      }
      .card-main-stage {
        max-width: 300px !important;
      }
      .preview-media {
        height: 145px !important;
      }
      .card-satellite-side {
        display: none !important;
      }
    }

    @media (max-width: 992px) {
      .events-editorial-hero {
        height: auto !important;
        min-height: auto !important;
        max-height: none !important;
        padding: 2.5rem 0 !important;
      }
      .hero-cards-composition {
        margin-top: 1.5rem;
        height: auto !important;
        min-height: auto !important;
      }
      .card-satellite-top,
      .card-satellite-bottom,
      .card-satellite-side {
        display: none !important;
      }
      .card-main-stage {
        transform: none !important;
        margin: 0 auto;
        max-width: 100% !important;
      }
    }

    /* ==========================================================
       SECTION TITLE & NARRATIVE
       ========================================================== */
    .events-catalogue-section {
      scroll-margin-top: 80px;
    }

    .section-indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22D3EE;
      box-shadow: 0 0 10px #22D3EE;
    }

    .section-eyebrow {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #22D3EE;
    }

    .section-main-heading {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 3.5vw, 2.75rem);
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.025em;
      line-height: 1.15;
    }

    .section-description {
      font-size: 1rem;
      color: var(--text-muted);
      max-width: 640px;
    }

    .results-pill-counter {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.15rem;
      border-radius: var(--radius-pill);
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .counter-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    /* ==========================================================
       CATEGORY PILLS ROW
       ========================================================== */
    .category-pills-scroll {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      scrollbar-width: thin;
    }

    .cat-pill {
      padding: 0.55rem 1.15rem;
      border-radius: var(--radius-pill);
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
    }

    .cat-pill:hover {
      color: var(--text-main);
      border-color: var(--border-medium);
      background: var(--hover-overlay);
      transform: translateY(-1px);
    }

    .cat-pill.active {
      background: linear-gradient(135deg, #6C7CFF 0%, #A855F7 100%);
      color: #FFFFFF;
      border-color: transparent;
      box-shadow: 0 4px 14px var(--primary-glow);
    }

    /* ==========================================================
       FLOATING GLASSMORHIC FILTER TOOLBAR
       ========================================================== */
    .floating-filter-toolbar {
      background: var(--bg-glass-heavy);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-md);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      transition: all var(--transition-normal);
    }

    .floating-filter-toolbar:hover {
      border-color: rgba(108, 124, 255, 0.35);
      box-shadow: var(--shadow-lg);
    }

    .filter-toolbar-grid {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr auto;
      gap: 1.25rem;
      align-items: flex-end;
    }

    @media (max-width: 1024px) {
      .filter-toolbar-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .filter-toolbar-grid {
        grid-template-columns: 1fr;
      }
    }

    .filter-cell {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .cell-label {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .icon-cyan { color: #22D3EE; }
    .icon-purple { color: #A855F7; }
    .icon-pink { color: #EC4899; }
    .icon-blue { color: #6C7CFF; }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .toolbar-input,
    .toolbar-select {
      width: 100%;
      padding: 0.78rem 1rem;
      border-radius: var(--radius-md);
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 0.925rem;
      outline: none;
      transition: all var(--transition-fast);
    }

    .toolbar-input:focus,
    .toolbar-select:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    .toolbar-input::placeholder {
      color: var(--text-dim);
    }

    .input-clear-btn {
      position: absolute;
      right: 10px;
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 4px 6px;
    }

    .input-clear-btn:hover {
      color: var(--text-main);
    }

    .filter-actions-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-apply-filters {
      background: linear-gradient(135deg, #6C7CFF 0%, #A855F7 100%);
      color: #FFFFFF;
      border: none;
      padding: 0.78rem 1.5rem;
      border-radius: var(--radius-btn);
      font-size: 0.925rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      box-shadow: var(--shadow-primary);
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .btn-apply-filters:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px var(--primary-glow);
    }

    .btn-reset-filters {
      background: var(--bg-surface);
      color: var(--text-muted);
      border: 1px solid var(--border-subtle);
      width: 44px;
      height: 44px;
      border-radius: var(--radius-btn);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-reset-filters:hover {
      color: var(--text-main);
      border-color: var(--border-medium);
      transform: rotate(-90deg);
    }

    /* Active Filter Tags Strip */
    .active-filters-strip {
      font-size: 0.825rem;
    }

    .active-badge-label {
      font-weight: 600;
      color: var(--text-dim);
    }

    .active-filter-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(108, 124, 255, 0.12);
      border: 1px solid rgba(108, 124, 255, 0.3);
      color: #F8FAFC;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-pill);
      font-size: 0.78rem;
    }

    .active-filter-tag button {
      background: transparent;
      border: none;
      color: #F8FAFC;
      font-size: 0.95rem;
      line-height: 1;
      cursor: pointer;
      padding: 0 2px;
    }

    .btn-clear-all-link {
      background: transparent;
      border: none;
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: underline;
    }

    /* ==========================================================
       DYNAMIC EVENTS CATALOGUE GRID
       ========================================================== */
    .editorial-events-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.85rem;
    }

    @media (max-width: 1024px) {
      .editorial-events-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1.5rem;
      }
    }

    @media (max-width: 680px) {
      .editorial-events-grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
    }

    .event-grid-item {
      animation: cardFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
    }

    @keyframes cardFadeInUp {
      from {
        opacity: 0;
        transform: translateY(22px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
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
  error = signal<string | null>(null);

  search: string = '';
  selectedVenueId?: number;
  selectedCategoryId?: number;
  selectedDate?: string;

  ngOnInit(): void {
    this.loadFilterOptions();

    this.route.queryParams.subscribe(params => {
      this.search = params['search'] || '';
      this.selectedVenueId = params['venueId'] ? parseInt(params['venueId'], 10) : undefined;
      this.selectedCategoryId = params['categoryId'] ? parseInt(params['categoryId'], 10) : undefined;
      this.selectedDate = params['date'] || undefined;

      this.loadEvents();
    });
  }

  loadFilterOptions(): void {
    this.venueService.getVenues().subscribe({
      next: (v) => this.venues.set(v || []),
      error: () => {}
    });
    this.categoryService.getCategories().subscribe({
      next: (c) => this.categories.set(c || []),
      error: () => {}
    });
  }

  loadEvents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventService.getEvents({
      search: this.search || undefined,
      venueId: this.selectedVenueId,
      categoryId: this.selectedCategoryId,
      date: this.selectedDate || undefined
    }).subscribe({
      next: (data) => {
        this.events.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to retrieve events. Please check connection to the backend.');
      }
    });
  }

  applyFilters(): void {
    const queryParams: any = {};
    if (this.search) queryParams.search = this.search;
    if (this.selectedVenueId) queryParams.venueId = this.selectedVenueId;
    if (this.selectedCategoryId) queryParams.categoryId = this.selectedCategoryId;
    if (this.selectedDate) queryParams.date = this.selectedDate;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: ''
    });
  }

  resetFilters(): void {
    this.search = '';
    this.selectedVenueId = undefined;
    this.selectedCategoryId = undefined;
    this.selectedDate = undefined;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  selectCategory(catId?: number): void {
    this.selectedCategoryId = catId;
    this.applyFilters();
  }

  clearSearch(): void {
    this.search = '';
    this.applyFilters();
  }

  clearVenue(): void {
    this.selectedVenueId = undefined;
    this.applyFilters();
  }

  clearCategory(): void {
    this.selectedCategoryId = undefined;
    this.applyFilters();
  }

  clearDate(): void {
    this.selectedDate = undefined;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.search || this.selectedVenueId || this.selectedCategoryId || this.selectedDate);
  }

  getVenueName(id?: number): string {
    if (!id) return '';
    const v = this.venues().find(x => x.id === id);
    return v ? v.name : `Venue #${id}`;
  }

  getCategoryName(id?: number): string {
    if (!id) return '';
    const c = this.categories().find(x => x.id === id);
    return c ? c.name : `Category #${id}`;
  }

  scrollToCatalogue(): void {
    const el = document.getElementById('catalogue-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  getHeroEvent(index: number): any {
    const list = this.events();
    if (list && list.length > index) {
      return list[index];
    }
    const defaults = [
      {
        id: 1,
        title: 'Neon Odyssey Symphony & Light Experience',
        venueName: 'Grand Horizon Amphitheater, Bayfront',
        categoryName: 'Electronic Symphony',
        eventDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        capacity: 450,
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 2,
        title: 'Global Tech Innovators Summit 2026',
        venueName: 'Metropolitan Tech Center',
        categoryName: 'Tech Summit',
        eventDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        capacity: 800,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 3,
        title: 'Championship Finals: Cyber Arena Pro League',
        venueName: 'Apex Colosseum Hall B',
        categoryName: 'Esports Championship',
        eventDate: new Date(Date.now() + 86400000 * 12).toISOString(),
        capacity: 320,
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'
      }
    ];
    return defaults[index % defaults.length];
  }

  getEventImage(event: any, fallbackIndex: number): string {
    if (event?.imageUrl && event.imageUrl.trim().length > 5) {
      return event.imageUrl;
    }
    const category = (event?.categoryName || '').toLowerCase();
    const title = (event?.title || '').toLowerCase();

    if (category.includes('music') || category.includes('concert') || title.includes('symphony') || title.includes('music')) {
      return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('tech') || category.includes('summit') || category.includes('conference')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('sport') || category.includes('league') || category.includes('champ') || category.includes('arena')) {
      return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('theatre') || category.includes('art') || category.includes('drama')) {
      return 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=80';
    }

    const fallbacks = [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80'
    ];
    return fallbacks[fallbackIndex % fallbacks.length];
  }
}

export const EventListComponent = EventsComponent;
export type EventListComponent = EventsComponent;
