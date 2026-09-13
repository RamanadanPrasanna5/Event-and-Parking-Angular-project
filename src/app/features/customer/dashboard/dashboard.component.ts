import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventDto } from '../../../core/models/event.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-customer-dashboard, app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, ErrorBannerComponent],
  template: `
    <div class="home-wrapper">
      <!-- CINEMATIC FULL-VIEWPORT EDITORIAL HERO SECTION -->
      <section class="hero-section position-relative">
        <!-- Background Atmospheric Radial Gradient Blobs -->
        <div class="editorial-blobs-layer" aria-hidden="true">
          <div class="gradient-blob blob-blue"></div>
          <div class="gradient-blob blob-purple"></div>
          <div class="gradient-blob blob-cyan"></div>
        </div>

        <!-- Scattered Graphic "+" Symbol Accents -->
        <div class="decor-plus decor-plus-1" aria-hidden="true">+</div>
        <div class="decor-plus decor-plus-2" aria-hidden="true">+</div>
        <div class="decor-plus decor-plus-3" aria-hidden="true">+</div>
        <div class="decor-plus decor-plus-4" aria-hidden="true">+</div>
        <div class="decor-plus decor-plus-5" aria-hidden="true">+</div>

        <div class="container position-relative hero-z-index w-100 hero-inner-container">
          <div class="row align-items-center g-4 g-xl-5">
            <!-- Left: Hero Headline & Actions -->
            <div class="col-lg-6 hero-content-col text-start">
              <div class="hero-badge-pill">
                <span class="badge-pulse"></span>
                <span>CURATED LIVE STAGES & SMART PARKING</span>
              </div>

              <h1 class="hero-headline">
                Discover Events <br />
                <span class="gradient-text-hero">Worth Remembering.</span>
              </h1>

              <p class="hero-subhead">
                Discover premier live concerts, sports championships, stage theatre and conferences. Select your exact seats on interactive visual maps and reserve synchronized venue parking bays in one seamless checkout.
              </p>

              <div class="d-flex flex-wrap align-items-center gap-3 hero-actions-row">
                <a routerLink="/events" class="btn btn-primary btn-md">
                  <i class="fa-regular fa-compass me-2"></i> Explore All Events
                </a>
                @if (!authService.isLoggedIn()) {
                  <a routerLink="/register" class="btn btn-secondary btn-md">
                    <i class="fa-solid fa-user-plus me-2"></i> Create Free Account
                  </a>
                } @else {
                  <a routerLink="/customer/my-bookings" class="btn btn-secondary btn-md">
                    <i class="fa-solid fa-ticket me-2"></i> View My Bookings
                  </a>
                }
              </div>

              <!-- 3 Metric Highlights -->
              <div class="hero-stats-row grid grid-cols-3 gap-2 gap-sm-3">
                <div class="hero-stat-box">
                  <div class="stat-number">100%</div>
                  <div class="stat-desc">Unified Booking</div>
                </div>
                <div class="hero-stat-box">
                  <div class="stat-number">15 Min</div>
                  <div class="stat-desc">Guaranteed Hold</div>
                </div>
                <div class="hero-stat-box">
                  <div class="stat-number">Zero</div>
                  <div class="stat-desc">Conflicts</div>
                </div>
              </div>
            </div>

            <!-- Right: Premium Floating Event-Card Composition (Vertically Centered) -->
            <div class="col-lg-6 hero-showcase-col">
              <div class="hero-showcase-container">
                @if (displayEvents().length > 0) {
                  <!-- Main Featured Event Card -->
                  <div class="hero-featured-card card p-0 overflow-hidden shadow-2xl">
                    <div class="hero-card-img-wrap">
                      <img
                        [src]="getEventImage(displayEvents()[0])"
                        [alt]="displayEvents()[0].title"
                        class="hero-card-img"
                        (error)="onImgFallback($event, displayEvents()[0])" />
                      <div class="hero-media-overlay"></div>
                      <span class="badge badge-primary hero-cat-tag">
                        {{ displayEvents()[0].categoryName || 'Premier Event' }}
                      </span>
                      <span class="badge badge-gold hero-floating-tag">
                        {{ displayEvents()[0].status || 'Booking Open' }}
                      </span>
                    </div>

                    <div class="p-3 p-sm-4 bg-card hero-card-body-compact">
                      <div class="event-schedule-row mb-1">
                        <i class="fa-regular fa-calendar-check text-cyan me-1"></i>
                        <span>{{ displayEvents()[0].eventDate | date:'mediumDate' }}</span>
                        <span class="mx-1 text-dim">&bull;</span>
                        <span class="text-muted"><i class="fa-regular fa-clock me-1"></i> {{ displayEvents()[0].eventDate | date:'shortTime' }}</span>
                      </div>

                      <h3 class="hero-card-title mb-1 text-truncate">{{ displayEvents()[0].title }}</h3>
                      <p class="hero-card-venue mb-2 text-truncate">
                        <i class="fa-solid fa-location-dot text-primary me-1"></i> {{ displayEvents()[0].venueName || 'Grand Arena Hall' }}
                      </p>

                      <div class="hero-card-meta d-flex justify-content-between align-items-center pt-2 border-top border-subtle">
                        <div>
                          <small class="text-dim d-block">Available Seats</small>
                          <strong class="text-main fs-6">{{ displayEvents()[0].capacity }} Seats</strong>
                        </div>
                        <a [routerLink]="['/events', displayEvents()[0].id]" class="btn-book-now" [attr.aria-label]="'Book tickets for ' + displayEvents()[0].title">
                          <span>Book Now</span>
                          <i class="fa-solid fa-arrow-right arrow-icon"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Satellite Card 1 (Offset Top-Right) -->
                  @if (displayEvents().length > 1) {
                    <div class="hero-satellite-card card-satellite-top">
                      <div class="d-flex align-items-center gap-2">
                        <img
                          [src]="getEventImage(displayEvents()[1])"
                          [alt]="displayEvents()[1].title"
                          class="satellite-thumb"
                          (error)="onImgFallback($event, displayEvents()[1])" />
                        <div class="flex-grow-1 overflow-hidden">
                          <span class="satellite-tag">{{ displayEvents()[1].categoryName || 'Live' }}</span>
                          <h4 class="satellite-title text-truncate">{{ displayEvents()[1].title }}</h4>
                          <small class="text-muted">{{ displayEvents()[1].eventDate | date:'MMM d' }}</small>
                        </div>
                        <a [routerLink]="['/events', displayEvents()[1].id]" class="satellite-btn" aria-label="View event">
                          <i class="fa-solid fa-chevron-right"></i>
                        </a>
                      </div>
                    </div>
                  }

                  <!-- Satellite Card 2 (Offset Bottom-Right) -->
                  @if (displayEvents().length > 2) {
                    <div class="hero-satellite-card card-satellite-side">
                      <div class="d-flex align-items-center gap-2">
                        <img
                          [src]="getEventImage(displayEvents()[2])"
                          [alt]="displayEvents()[2].title"
                          class="satellite-thumb-sm"
                          (error)="onImgFallback($event, displayEvents()[2])" />
                        <div class="flex-grow-1 overflow-hidden">
                          <span class="satellite-tag tag-magenta">{{ displayEvents()[2].categoryName || 'Arena' }}</span>
                          <h4 class="satellite-title text-truncate">{{ displayEvents()[2].title }}</h4>
                        </div>
                        <a [routerLink]="['/events', displayEvents()[2].id]" class="satellite-btn" aria-label="View event">
                          <i class="fa-solid fa-arrow-right"></i>
                        </a>
                      </div>
                    </div>
                  }

                  <!-- Floating Parking Pill (Kept & Enhanced) -->
                  <div class="floating-parking-pill shadow-lg">
                    <div class="parking-icon-circle">
                      <i class="fa-solid fa-square-parking"></i>
                    </div>
                    <div>
                      <div class="fw-bold small text-main">Bay A-04 Reserved</div>
                      <small class="text-muted">VIP Covered Zone Included</small>
                    </div>
                    <span class="parking-pulse-dot"></span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- EXPLORE EXPERIENCES BY CATEGORY -->
      <section class="py-5 bg-surface-alt">
        <div class="container py-4">
          <div class="d-flex flex-wrap justify-content-between align-items-end mb-4">
            <div>
              <span class="badge badge-gold mb-2">Curated Categories</span>
              <h2 class="section-title">Explore by Experience</h2>
              <p class="section-subhead">Find unforgettable entertainment curated for every passion.</p>
            </div>
            <a routerLink="/events" class="btn btn-outline btn-sm">
              All Categories <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
          </div>

          <div class="grid grid-cols-4 gap-3">
            <a routerLink="/events" class="category-feature-card">
              <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=80" alt="Concerts & Music" class="cat-img" />
              <div class="cat-overlay">
                <div class="category-icon-box">
                  <i class="fa-solid fa-guitar"></i>
                </div>
                <h3 class="cat-title">Live Concerts</h3>
                <p class="cat-sub">Arena tours, festivals & DJs</p>
              </div>
            </a>

            <a routerLink="/events" class="category-feature-card">
              <img src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=700&auto=format&fit=crop&q=80" alt="Sports & Stadiums" class="cat-img" />
              <div class="cat-overlay">
                <div class="category-icon-box">
                  <i class="fa-solid fa-trophy"></i>
                </div>
                <h3 class="cat-title">Sports & Arenas</h3>
                <p class="cat-sub">Football, cricket & racing</p>
              </div>
            </a>

            <a routerLink="/events" class="category-feature-card">
              <img src="https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=700&auto=format&fit=crop&q=80" alt="Theatre & Arts" class="cat-img" />
              <div class="cat-overlay">
                <div class="category-icon-box">
                  <i class="fa-solid fa-masks-theater"></i>
                </div>
                <h3 class="cat-title">Stage & Theatre</h3>
                <p class="cat-sub">Drama, comedy & opera</p>
              </div>
            </a>

            <a routerLink="/events" class="category-feature-card">
              <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&auto=format&fit=crop&q=80" alt="Conferences" class="cat-img" />
              <div class="cat-overlay">
                <div class="category-icon-box">
                  <i class="fa-solid fa-lightbulb"></i>
                </div>
                <h3 class="cat-title">Conferences & Tech</h3>
                <p class="cat-sub">Keynotes, summits & expos</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- UPCOMING EVENTS SPOTLIGHT WITH EDITORIAL CARDS -->
      <section class="py-5">
        <div class="container py-4">
          <div class="d-flex flex-wrap justify-content-between align-items-end mb-4">
            <div>
              <span class="badge badge-primary mb-2">Happening Soon</span>
              <h2 class="section-title">Featured Upcoming Events</h2>
              <p class="section-subhead">Secure prime front-row seats and optional venue parking before spots sell out.</p>
            </div>
            <a routerLink="/events" class="btn btn-outline btn-sm">
              View All Events <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
          </div>

          @if (loading()) {
            <app-loading message="Loading upcoming events..."></app-loading>
          } @else if (error()) {
            <app-error-banner [message]="error()!" (retry)="loadUpcomingEvents()"></app-error-banner>
          } @else {
            <div class="grid grid-cols-3 gap-4">
              @for (ev of displayEvents(); track ev.id) {
                <div class="card premium-event-card d-flex flex-column justify-content-between p-0 overflow-hidden">
                  <div>
                    <div class="event-image-container position-relative">
                      <img [src]="getEventImage(ev)" [alt]="ev.title" class="event-img" (error)="onImgFallback($event, ev)" />
                      <div class="media-overlay"></div>
                      <span class="badge badge-primary event-category-chip">{{ ev.categoryName || 'Featured' }}</span>
                      <span class="badge badge-gold event-status-chip">{{ ev.status || 'Booking Open' }}</span>
                    </div>

                    <div class="p-4 pb-2">
                      <div class="event-date mb-2">
                        <i class="fa-regular fa-calendar-check me-1 text-primary"></i>
                        {{ ev.eventDate | date:'mediumDate' }}
                        <span class="mx-1 text-dim">&bull;</span>
                        <span class="text-muted"><i class="fa-regular fa-clock me-1"></i> {{ ev.eventDate | date:'shortTime' }}</span>
                      </div>

                      <h3 class="event-title mb-2">{{ ev.title }}</h3>
                      <p class="event-desc mb-3">{{ ev.description | slice:0:110 }}...</p>

                      <div class="event-venue mb-3">
                        <i class="fa-solid fa-location-dot text-primary me-1"></i> {{ ev.venueName || 'Main Arena' }}
                      </div>
                    </div>
                  </div>

                  <div class="card-footer-action p-4 pt-3 border-top border-subtle d-flex align-items-center justify-content-between">
                    <div>
                      <small class="text-dim d-block">Available Capacity</small>
                      <strong class="text-main">{{ ev.capacity }} Seats</strong>
                    </div>
                    <a [routerLink]="['/events', ev.id]" class="btn-book-now" [attr.aria-label]="'Book tickets for ' + ev.title">
                      <span>Book Seats</span>
                      <i class="fa-solid fa-arrow-right arrow-icon"></i>
                    </a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>

      <!-- SMART PARKING INTEGRATION BANNER WITH PHOTO SHOWCASE -->
      <section class="py-5 bg-surface-alt">
        <div class="container py-4">
          <div class="parking-feature-banner p-4 p-md-5 overflow-hidden position-relative">
            <div class="row align-items-center d-flex flex-wrap g-4">
              <div class="col-lg-6 flex-grow-1" style="min-width: 320px; flex: 1.2;">
                <span class="badge badge-gold mb-2"><i class="fa-solid fa-square-parking me-1"></i> Smart Venue Parking</span>
                <h2 class="mb-3 banner-heading">Never Circle Around For Parking Again</h2>
                <p class="banner-sub mb-4">
                  Say goodbye to game-day parking chaos. Event Park synchronizes seat reservations with smart venue parking lots. Reserve your dedicated vehicle bay simultaneously with your event tickets under one single reservation ID.
                </p>

                <div class="d-flex flex-column gap-3 mb-4">
                  <div class="d-flex align-items-start gap-3">
                    <div class="feature-bullet-icon">
                      <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                      <strong class="d-block text-main">Color-Coded Live Bay Matrix</strong>
                      <span class="text-muted small">View real-time status: Available (Forest Green), Occupied (Muted Gray), and Selected (Gold).</span>
                    </div>
                  </div>

                  <div class="d-flex align-items-start gap-3">
                    <div class="feature-bullet-icon">
                      <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                      <strong class="d-block text-main">Zone Options (VIP, Covered & General)</strong>
                      <span class="text-muted small">Choose bays right next to the stadium exit gates for prompt arrival and departure.</span>
                    </div>
                  </div>

                  <div class="d-flex align-items-start gap-3">
                    <div class="feature-bullet-icon">
                      <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <div>
                      <strong class="d-block text-main">15-Minute Guaranteed Concurrency Hold</strong>
                      <span class="text-muted small">Both your seats and parking bay are reserved exclusively while you complete checkout.</span>
                    </div>
                  </div>
                </div>

                <a routerLink="/events" class="btn btn-primary">
                  <i class="fa-solid fa-car-side me-2"></i> Explore Events with Parking
                </a>
              </div>

              <!-- Real Parking Photo & Mockup Box -->
              <div class="col-lg-5 flex-grow-1 text-center" style="min-width: 300px; flex: 0.9;">
                <div class="parking-visual-container">
                  <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=80" alt="Modern Venue Parking Bay" class="parking-photo" />
                  
                  <div class="parking-mockup-overlay p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge badge-success"><i class="fa-solid fa-check"></i> Bay A-04 Reserved</span>
                      <small class="text-gold">Zone A (VIP Gate)</small>
                    </div>
                    <div class="d-flex justify-content-center gap-2">
                      <div class="mock-slot available">A-01</div>
                      <div class="mock-slot occupied">A-02</div>
                      <div class="mock-slot occupied">A-03</div>
                      <div class="mock-slot selected">A-04</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ICONIC PARTNER VENUES SHOWCASE -->
      <section class="py-5">
        <div class="container py-4">
          <div class="text-center mb-5">
            <span class="badge badge-gold mb-2">World-Class Locations</span>
            <h2 class="section-title">Iconic Partner Venues</h2>
            <p class="section-subhead">Hosting premier performances with state-of-the-art acoustics and managed parking infrastructure.</p>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="venue-showcase-card card p-0 overflow-hidden">
              <div class="venue-showcase-img-box position-relative">
                <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&auto=format&fit=crop&q=80" alt="Grand Arena Stadium" class="venue-showcase-img" />
                <span class="badge badge-primary position-absolute" style="top: 12px; right: 12px;">Stadium</span>
              </div>
              <div class="p-4">
                <h4 class="mb-1 text-main">Grand National Arena</h4>
                <p class="text-muted small mb-3"><i class="fa-solid fa-location-dot text-primary me-1"></i> Colombo 07 • Central Metropolis</p>
                <div class="d-flex justify-content-between text-dim small border-top border-subtle pt-3">
                  <span><i class="fa-solid fa-users me-1 text-primary"></i> 18,000 Capacity</span>
                  <span><i class="fa-solid fa-car me-1 text-accent"></i> 350 Parking Bays</span>
                </div>
              </div>
            </div>

            <div class="venue-showcase-card card p-0 overflow-hidden">
              <div class="venue-showcase-img-box position-relative">
                <img src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=700&auto=format&fit=crop&q=80" alt="Convention Center" class="venue-showcase-img" />
                <span class="badge badge-gold position-absolute" style="top: 12px; right: 12px;">Convention</span>
              </div>
              <div class="p-4">
                <h4 class="mb-1 text-main">Metropolis Expo Center</h4>
                <p class="text-muted small mb-3"><i class="fa-solid fa-location-dot text-primary me-1"></i> Tech City • West Tower</p>
                <div class="d-flex justify-content-between text-dim small border-top border-subtle pt-3">
                  <span><i class="fa-solid fa-users me-1 text-primary"></i> 6,500 Capacity</span>
                  <span><i class="fa-solid fa-car me-1 text-accent"></i> 180 Parking Bays</span>
                </div>
              </div>
            </div>

            <div class="venue-showcase-card card p-0 overflow-hidden">
              <div class="venue-showcase-img-box position-relative">
                <img src="https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=700&auto=format&fit=crop&q=80" alt="Opera House" class="venue-showcase-img" />
                <span class="badge badge-primary position-absolute" style="top: 12px; right: 12px;">Theatre</span>
              </div>
              <div class="p-4">
                <h4 class="mb-1 text-main">Royal Symphony Hall</h4>
                <p class="text-muted small mb-3"><i class="fa-solid fa-location-dot text-primary me-1"></i> Harbor Boulevard • District 01</p>
                <div class="d-flex justify-content-between text-dim small border-top border-subtle pt-3">
                  <span><i class="fa-solid fa-users me-1 text-primary"></i> 3,200 Capacity</span>
                  <span><i class="fa-solid fa-car me-1 text-accent"></i> 95 Parking Bays</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS STEP BY STEP -->
      <section id="how-it-works" class="py-5 bg-surface-alt">
        <div class="container py-4">
          <div class="text-center mb-5">
            <span class="badge badge-gold mb-2">Effortless Flow</span>
            <h2 class="section-title">How Event Park Works</h2>
            <p class="section-subhead">From discovery to guaranteed arrival in four seamless steps.</p>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="step-card card text-center p-4">
              <div class="step-badge">1</div>
              <div class="step-icon mb-3">
                <i class="fa-regular fa-calendar-check"></i>
              </div>
              <h4 class="text-main mb-2">Browse Events</h4>
              <p class="text-muted mb-0 small">Filter by category, venue, and dates to discover your favorite performances.</p>
            </div>

            <div class="step-card card text-center p-4">
              <div class="step-badge">2</div>
              <div class="step-icon mb-3">
                <i class="fa-solid fa-couch"></i>
              </div>
              <h4 class="text-main mb-2">Pick Your Seats</h4>
              <p class="text-muted mb-0 small">Select your exact preferred seats on our real-time interactive stage grid.</p>
            </div>

            <div class="step-card card text-center p-4">
              <div class="step-badge">3</div>
              <div class="step-icon mb-3">
                <i class="fa-solid fa-square-parking"></i>
              </div>
              <h4 class="text-main mb-2">Reserve Parking</h4>
              <p class="text-muted mb-0 small">Optionally bundle an allocated parking bay right at the venue with one click.</p>
            </div>

            <div class="step-card card text-center p-4">
              <div class="step-badge">4</div>
              <div class="step-icon mb-3">
                <i class="fa-regular fa-circle-check"></i>
              </div>
              <h4 class="text-main mb-2">Confirm & Enjoy</h4>
              <p class="text-muted mb-0 small">Complete simulated checkout, get instant receipts, and arrive hassle-free.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-wrapper {
      position: relative;
      overflow-x: hidden;
      font-family: var(--font-body);
    }
    .hero-section {
      position: relative;
      height: calc(100vh - 72px);
      min-height: calc(100vh - 72px);
      max-height: calc(100vh - 72px);
      width: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-main);
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }
    .hero-inner-container {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    .hero-z-index {
      z-index: 2;
    }
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
      top: -100px;
      left: -80px;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, rgba(108, 124, 255, 0.42) 0%, rgba(108, 124, 255, 0) 70%);
      filter: blur(80px);
      animation: floatBlobSlow 20s ease-in-out infinite;
    }
    .blob-purple {
      top: 80px;
      right: -80px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.38) 0%, rgba(236, 72, 153, 0.22) 50%, rgba(168, 85, 247, 0) 70%);
      filter: blur(85px);
      animation: floatBlobSlow 24s ease-in-out infinite reverse;
    }
    .blob-cyan {
      bottom: -60px;
      left: 30%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, rgba(34, 211, 238, 0) 70%);
      filter: blur(75px);
      animation: floatBlobSlow 18s ease-in-out infinite;
    }
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
    .decor-plus-1 { top: 40px; left: 5%; animation-delay: 0s; }
    .decor-plus-2 { top: 80px; left: 45%; color: #A855F7; animation-delay: 1.5s; font-size: 1.5rem; }
    .decor-plus-3 { bottom: 60px; left: 4%; color: #22D3EE; animation-delay: 2.8s; font-size: 1.1rem; }
    .decor-plus-4 { top: 100px; right: 4%; color: #EC4899; animation-delay: 0.8s; font-size: 1.4rem; }
    .decor-plus-5 { bottom: 40px; right: 28%; color: #6C7CFF; animation-delay: 3.5s; font-size: 1.2rem; }

    .hero-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.95rem;
      background: rgba(34, 211, 238, 0.10);
      border: 1px solid rgba(34, 211, 238, 0.35);
      border-radius: var(--radius-pill);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #22D3EE;
      margin-bottom: 0.6rem !important;
    }
    .badge-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22D3EE;
      box-shadow: 0 0 10px #22D3EE;
    }
    .hero-headline {
      font-family: var(--font-heading);
      font-size: clamp(2.1rem, 3.8vw, 3.4rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.08;
      color: var(--text-main);
      margin-bottom: 0.75rem !important;
    }
    .hero-subhead {
      font-size: clamp(0.92rem, 1.25vw, 1.05rem);
      line-height: 1.55;
      color: var(--text-muted);
      max-width: 520px;
      margin-bottom: 1.1rem !important;
    }
    .hero-actions-row {
      margin-bottom: 1.1rem !important;
    }
    .hero-stats-row {
      max-width: 520px;
    }
    .hero-stat-box {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
      padding: 0.55rem 0.85rem !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    .hero-stat-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #6C7CFF, transparent);
    }
    .hero-stat-box:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .stat-number {
      font-size: 1.45rem;
      font-weight: 800;
      font-family: var(--font-heading);
      color: var(--primary);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .stat-desc {
      font-size: 0.72rem;
      color: var(--text-muted);
      line-height: 1.3;
      font-weight: 600;
    }

    /* Asymmetric Floating Event Cards Showcase */
    .hero-showcase-container {
      position: relative;
      height: 420px;
      max-height: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1000px;
    }
    .hero-featured-card {
      width: 100%;
      max-width: 340px;
      border: 1px solid var(--border-medium);
      border-radius: 20px;
      background: var(--bg-glass-heavy);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55), 0 0 30px rgba(108, 124, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transform: rotate(-2deg);
      z-index: 3;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-featured-card:hover {
      transform: rotate(0deg) translateY(-4px) scale(1.02);
      border-color: rgba(108, 124, 255, 0.45);
      box-shadow: 0 26px 65px rgba(0, 0, 0, 0.65), 0 0 45px rgba(108, 124, 255, 0.3);
    }
    .hero-card-img-wrap {
      position: relative;
      height: 175px;
      overflow: hidden;
      background: var(--bg-surface);
    }
    .hero-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .hero-featured-card:hover .hero-card-img {
      transform: scale(1.06);
    }
    .hero-media-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 21, 37, 0.05) 0%, rgba(7, 21, 37, 0.75) 100%);
      pointer-events: none;
    }
    .hero-cat-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 2;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-pill);
      background: linear-gradient(135deg, rgba(108, 124, 255, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%);
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .hero-floating-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 2;
      padding: 0.3rem 0.7rem;
      border-radius: var(--radius-pill);
      background: rgba(7, 21, 37, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #F8FAFC;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .hero-card-body-compact {
      padding: 0.95rem 1.15rem !important;
    }
    .event-schedule-row {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .hero-card-title {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.25;
    }
    .hero-card-venue {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* Satellite Floating Cards */
    .hero-satellite-card {
      position: absolute;
      background: var(--bg-glass-heavy);
      border: 1px solid var(--border-medium);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: var(--radius-md);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .card-satellite-top {
      top: 15px;
      right: -20px;
      width: 250px;
      padding: 0.65rem 0.85rem;
      transform: rotate(4deg);
      z-index: 4;
      animation: floatCardGentle 6s ease-in-out infinite;
    }
    .card-satellite-side {
      bottom: 10px;
      right: -15px;
      width: 235px;
      padding: 0.55rem 0.85rem;
      transform: rotate(2.5deg);
      z-index: 5;
      animation: floatCardGentle 8s ease-in-out infinite;
    }
    .satellite-thumb {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      flex-shrink: 0;
    }
    .satellite-thumb-sm {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      flex-shrink: 0;
    }
    .satellite-tag {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #A855F7;
    }
    .tag-magenta {
      color: #EC4899;
    }
    .satellite-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0.1rem 0;
      line-height: 1.25;
    }
    .satellite-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      transition: all var(--transition-fast);
      text-decoration: none;
      flex-shrink: 0;
    }
    .satellite-btn:hover {
      background: var(--primary);
      color: #FFFFFF;
      transform: scale(1.1);
    }

    /* Floating Parking Pill */
    .floating-parking-pill {
      position: absolute;
      bottom: 20px;
      left: -20px;
      background: var(--bg-glass-heavy);
      border: 1px solid var(--border-medium);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: var(--radius-md);
      padding: 0.55rem 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      z-index: 4;
      transform: rotate(-3deg);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
      animation: floatCardGentle 7s ease-in-out infinite reverse;
    }
    .parking-icon-circle {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: rgba(34, 211, 238, 0.15);
      border: 1px solid rgba(34, 211, 238, 0.35);
      color: #22D3EE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .parking-pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
      flex-shrink: 0;
    }

    @media (max-height: 740px) {
      .hero-headline {
        font-size: clamp(1.8rem, 3.2vw, 2.7rem) !important;
        margin-bottom: 0.5rem !important;
      }
      .hero-subhead {
        font-size: 0.88rem !important;
        margin-bottom: 0.85rem !important;
        line-height: 1.45 !important;
      }
      .hero-showcase-container {
        height: 380px !important;
      }
      .hero-card-img-wrap {
        height: 155px !important;
      }
    }

    @media (max-width: 992px) {
      .hero-section {
        height: auto;
        min-height: auto;
        max-height: none;
        padding: 3rem 0;
      }
      .card-satellite-top,
      .card-satellite-side,
      .floating-parking-pill {
        display: none !important;
      }
      .hero-featured-card {
        transform: none !important;
        margin: 0 auto;
        max-width: 360px;
      }
      .hero-showcase-container {
        height: auto;
        max-height: none;
        margin-top: 2rem;
      }
    }
    .bg-surface-alt {
      background-color: var(--bg-surface-alt);
    }
    .section-title {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 3.5vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 0.4rem;
      color: var(--text-main);
    }
    .section-subhead {
      font-size: 1.05rem;
      color: var(--text-muted);
    }
    .category-feature-card {
      position: relative;
      height: 280px;
      border-radius: 20px;
      overflow: hidden;
      display: block;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      text-decoration: none;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .category-feature-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
      border-color: var(--border-medium);
    }
    .cat-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .category-feature-card:hover .cat-img {
      transform: scale(1.08);
    }
    .cat-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 21, 37, 0.15) 0%, rgba(7, 21, 37, 0.88) 100%);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .category-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      color: #FAF6EF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin-bottom: 0.85rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .cat-title {
      font-family: var(--font-heading);
      font-size: 1.3rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.25rem;
      letter-spacing: -0.01em;
    }
    .cat-sub {
      color: #D3DAD2;
      font-size: 0.85rem;
      margin-bottom: 0;
    }
    .premium-event-card {
      border: 1px solid var(--border-subtle);
      background: var(--bg-card);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .premium-event-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
      border-color: var(--border-medium);
    }
    .event-image-container {
      height: 220px;
      overflow: hidden;
      background-color: var(--bg-surface);
      position: relative;
    }
    .event-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .premium-event-card:hover .event-img {
      transform: scale(1.04);
    }
    .media-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(7, 21, 37, 0.05) 0%, rgba(7, 21, 37, 0.75) 100%);
      pointer-events: none;
    }
    .event-category-chip {
      position: absolute;
      top: 14px;
      left: 14px;
      z-index: 2;
    }
    .event-status-chip {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 2;
    }
    .event-date {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--primary);
    }
    .event-title {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1.35;
      color: var(--text-main);
    }
    .event-desc {
      font-size: 0.885rem;
      line-height: 1.55;
      color: var(--text-muted);
    }
    .event-venue {
      font-size: 0.85rem;
      color: var(--text-dim);
    }
    .parking-feature-banner {
      background: var(--bg-card);
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .banner-heading {
      font-family: var(--font-heading);
      font-size: 2.1rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .banner-sub {
      color: var(--text-muted);
      line-height: 1.7;
    }
    .feature-bullet-icon {
      font-size: 1.25rem;
      color: var(--primary);
      line-height: 1;
      margin-top: 2px;
    }
    .parking-visual-container {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border-medium);
      box-shadow: var(--shadow-md);
    }
    .parking-photo {
      width: 100%;
      height: 280px;
      object-fit: cover;
      filter: brightness(0.85);
    }
    .parking-mockup-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(20, 28, 22, 0.92);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(230, 222, 200, 0.15);
      color: #FAF6EF;
    }
    .text-gold {
      color: var(--accent);
      font-weight: 600;
    }
    .mock-slot {
      padding: 0.65rem 0.95rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.85rem;
      border: 1px solid transparent;
    }
    .mock-slot.available {
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
      border-color: rgba(52, 211, 153, 0.4);
    }
    .mock-slot.occupied {
      background: rgba(255, 255, 255, 0.08);
      color: #8C968A;
      border-color: rgba(255, 255, 255, 0.1);
    }
    .mock-slot.selected {
      background: var(--accent);
      color: #1F2722;
      border-color: var(--accent);
      box-shadow: 0 0 14px rgba(181, 154, 91, 0.5);
    }
    .venue-showcase-card {
      border: 1px solid var(--border-subtle);
      background: var(--bg-card);
      border-radius: var(--radius-md);
      transition: transform var(--transition-normal);
    }
    .venue-showcase-card:hover {
      transform: translateY(-4px);
    }
    .venue-showcase-img-box {
      height: 200px;
      overflow: hidden;
    }
    .venue-showcase-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }
    .venue-showcase-card:hover .venue-showcase-img {
      transform: scale(1.06);
    }
    .step-card {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      transition: transform var(--transition-normal);
    }
    .step-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
    }
    .step-badge {
      position: absolute;
      top: -14px;
      left: 20px;
      width: 32px;
      height: 32px;
      background: var(--primary);
      color: var(--text-on-primary);
      font-size: 0.9rem;
      font-weight: 800;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px var(--primary-glow);
      border: 2px solid var(--bg-card);
    }
    .step-icon {
      font-size: 2.2rem;
      color: var(--primary);
    }
    .parking-visual-container {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border-medium);
      box-shadow: var(--shadow-lg);
    }
    .parking-photo {
      width: 100%;
      height: 280px;
      object-fit: cover;
      filter: brightness(0.8);
      transition: transform var(--transition-slow);
    }
    .parking-visual-container:hover .parking-photo {
      transform: scale(1.04);
    }
    .parking-mockup-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--bg-glass-heavy);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-top: 1px solid var(--border-subtle);
    }
    .mock-slot {
      padding: 0.55rem 0.95rem;
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.85rem;
      border: 1px solid transparent;
      transition: all var(--transition-fast);
    }
    .mock-slot.available {
      background: var(--primary-subtle);
      color: var(--primary);
      border-color: var(--border-medium);
    }
    .mock-slot.occupied {
      background: var(--bg-surface-alt);
      color: var(--text-dim);
      opacity: 0.6;
      border-color: var(--border-subtle);
    }
    .mock-slot.selected {
      background: var(--accent);
      color: var(--text-on-primary);
      border-color: var(--accent);
      box-shadow: 0 0 12px var(--accent-gold-glow);
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private eventService = inject(EventService);

  events = signal<EventDto[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  private sampleCuratedEvents: EventDto[] = [
    {
      id: 1,
      title: 'Neon Symphony: Live World Arena Tour',
      description: 'An electrifying sensory live music experience with synchronized lasers, orchestral arrangements, and special guest international artists.',
      eventDate: new Date(Date.now() + 86400000 * 4).toISOString(),
      venueId: 1,
      venueName: 'Grand National Arena',
      categoryId: 1,
      categoryName: 'Live Concert',
      capacity: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
      status: 'Booking Open'
    },
    {
      id: 2,
      title: 'Premier Super League Grand Finals',
      description: 'The ultimate season showdown under stadium floodlights. Exclusive pitch-side seating and reserved VIP parking bays available.',
      eventDate: new Date(Date.now() + 86400000 * 9).toISOString(),
      venueId: 2,
      venueName: 'City Stadium',
      categoryId: 2,
      categoryName: 'Championship Match',
      capacity: 22000,
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      status: 'Fast Selling'
    },
    {
      id: 3,
      title: 'Global AI & Tech Expo 2026',
      description: 'Join pioneering founders and engineers discussing the future of AI, cloud architecture, and robotics across three auditorium tracks.',
      eventDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      venueId: 3,
      venueName: 'Metro Convention Center',
      categoryId: 4,
      categoryName: 'Tech Conference',
      capacity: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      status: 'Booking Open'
    }
  ];

  ngOnInit(): void {
    this.loadUpcomingEvents();
  }

  loadUpcomingEvents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.events.set([]);
        this.loading.set(false);
      }
    });
  }

  displayEvents(): EventDto[] {
    const loaded = this.events();
    if (loaded && loaded.length > 0) {
      return loaded.slice(0, 3);
    }
    return this.sampleCuratedEvents;
  }

  getEventImage(event: EventDto): string {
    if (event.imageUrl && event.imageUrl.trim().length > 5) {
      return event.imageUrl;
    }
    const category = (event.categoryName || '').toLowerCase();
    const title = (event.title || '').toLowerCase();

    if (category.includes('music') || category.includes('concert') || title.includes('music') || title.includes('symphony')) {
      return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('sport') || category.includes('league') || title.includes('match') || title.includes('championship')) {
      return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('theatre') || category.includes('art') || title.includes('drama') || title.includes('opera')) {
      return 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=80';
    }
    if (category.includes('tech') || category.includes('conference') || title.includes('summit') || title.includes('expo')) {
      return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
    }

    const fallbacks = [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80'
    ];
    return fallbacks[(event.id || 0) % fallbacks.length];
  }

  onImgFallback(e: any, ev: EventDto): void {
    e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80';
  }
}

export const HomeComponent = CustomerDashboardComponent;
export type HomeComponent = CustomerDashboardComponent;
