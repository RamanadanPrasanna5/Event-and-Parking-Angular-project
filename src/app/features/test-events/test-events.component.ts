import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { EventService } from '../../core/services/event.service';
import { EventDto } from '../../core/models/event.model';

@Component({
  selector: 'app-test-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px; font-family: sans-serif; background: #fff; color: #111;">
      <h2>API Read Test: GET /api/events</h2>
      <p>Target Endpoint: <code>https://localhost:7102/api/events</code></p>
      <p>Service: <code>EventService (src/app/core/services/event.service.ts)</code></p>
      <hr />

      <!-- Loading State -->
      <div *ngIf="loading" id="test-loading" style="padding: 12px; background: #e0f2fe; color: #0369a1; margin-bottom: 16px;">
        <strong>Loading:</strong> Fetching events from backend API...
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" id="test-error" style="padding: 12px; background: #fee2e2; color: #b91c1c; margin-bottom: 16px;">
        <strong>API Error Occurred:</strong>
        <p>Status Code: {{ statusCode }}</p>
        <p>Message: {{ errorMessage }}</p>
        <pre *ngIf="errorDetails">{{ errorDetails | json }}</pre>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !errorMessage && events.length === 0" id="test-empty" style="padding: 12px; background: #fef3c7; color: #92400e; margin-bottom: 16px;">
        <strong>No events found:</strong> The backend database returned an empty array <code>[]</code>.
      </div>

      <!-- Success State -->
      <div *ngIf="!loading && !errorMessage && events.length > 0" id="test-success">
        <div style="padding: 8px 12px; background: #dcfce7; color: #15803d; margin-bottom: 16px;">
          <strong>Success!</strong> Received HTTP {{ statusCode || 200 }}. Found {{ events.length }} event(s) from the database.
        </div>

        <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f3f4f6; text-align: left;">
              <th>ID</th>
              <th>Title</th>
              <th>Event Date</th>
              <th>Venue</th>
              <th>Category</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ev of events">
              <td>{{ ev.id }}</td>
              <td><strong>{{ ev.title }}</strong></td>
              <td>{{ ev.eventDate }}</td>
              <td>{{ ev.venueName }}</td>
              <td>{{ ev.categoryName }}</td>
              <td>{{ ev.capacity }}</td>
              <td>{{ ev.status }}</td>
            </tr>
          </tbody>
        </table>

        <h3>Raw Response JSON from Database:</h3>
        <pre id="test-raw-json" style="background: #f9fafb; padding: 12px; border: 1px solid #e5e7eb; overflow: auto; max-height: 400px;">{{ events | json }}</pre>
      </div>

      <button (click)="loadEvents()" style="padding: 8px 16px; cursor: pointer;">Re-fetch Events</button>
    </div>
  `
})
export class TestEventsComponent implements OnInit {
  private eventService = inject(EventService);

  events: EventDto[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  errorDetails: any = null;
  statusCode: number | null = null;

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.errorMessage = null;
    this.errorDetails = null;

    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data || [];
        this.statusCode = 200;
        this.loading = false;
        console.log('[TestEvents] Received events:', this.events);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.statusCode = err.status;
        this.errorMessage = err.message || 'HTTP request failed';
        this.errorDetails = err.error || err;
        console.error('[TestEvents] Error fetching events:', err);
      }
    });
  }
}
