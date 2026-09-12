import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { VenueService } from '../../../core/services/venue.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateEventDto, EventDto } from '../../../core/models/event.model';
import { Venue } from '../../../core/models/venue.model';
import { EventCategory } from '../../../core/models/category.model';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-events-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmationModalComponent,
    LoadingSpinnerComponent,
    ErrorBannerComponent
  ],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Catalogue Control</span>
          <h1 class="page-title mb-1">Manage Events</h1>
          <p class="text-muted mb-0">Create, edit, or configure seating and parking for events</p>
        </div>

        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="fa-solid fa-plus me-1"></i> Create Event
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading event inventory..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadEvents()"></app-error-banner>
      } @else {
        <div class="card p-0 overflow-hidden mb-4">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Category</th>
                  <th>Venue</th>
                  <th>Date & Time</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (ev of events(); track ev.id) {
                  <tr>
                    <td>
                      <div class="font-bold text-main">{{ ev.title }}</div>
                      <small class="text-muted">ID: #{{ ev.id }}</small>
                    </td>
                    <td>
                      <span class="badge badge-primary">{{ ev.categoryName || 'General' }}</span>
                    </td>
                    <td>{{ ev.venueName }}</td>
                    <td>
                      <div>{{ ev.eventDate | date:'mediumDate' }}</div>
                      <small class="text-muted">{{ ev.startTime || ev.time || (ev.eventDate | date:'shortTime') }}</small>
                    </td>
                    <td><strong>{{ ev.capacity }}</strong> seats</td>
                    <td>
                      <span class="badge badge-success">{{ ev.status || 'Active' }}</span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end align-items-center gap-1">
                        <a [routerLink]="['/events', ev.id]" class="btn btn-sm btn-secondary" title="View Event">
                          <i class="fa-solid fa-eye me-1"></i> View
                        </a>
                        <button class="btn btn-sm btn-secondary" (click)="openEditModal(ev)" title="Edit Event Details">
                          <i class="fa-solid fa-pen-to-square me-1"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="promptDelete(ev)" title="Delete Event">
                          <i class="fa-solid fa-trash me-1"></i> Delete
                        </button>
                        <a [routerLink]="['/admin/seats']" [queryParams]="{ eventId: ev.id }" class="btn btn-sm btn-secondary" title="Configure Seats">
                          <i class="fa-solid fa-couch"></i>
                        </a>
                        <a [routerLink]="['/admin/parking']" [queryParams]="{ eventId: ev.id }" class="btn btn-sm btn-secondary" title="Configure Parking">
                          <i class="fa-solid fa-square-parking"></i>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- CREATE / EDIT EVENT MODAL -->
      @if (showEventModal) {
        <div class="modal-overlay" (click)="closeModalOnBackdrop($event)">
          <div class="modal-container" style="max-width: 640px;">
            <div class="modal-header">
              <h4 class="mb-0">{{ isEditing ? 'Edit Event' : 'Create New Event' }}</h4>
              <button class="btn btn-icon btn-secondary" (click)="showEventModal = false">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="modal-body">
              <form [formGroup]="eventForm" (ngSubmit)="saveEvent()">
                <div class="form-group mb-3">
                  <label class="form-label" for="title">Event Title *</label>
                  <input id="title" type="text" class="form-control" formControlName="title" placeholder="e.g. Symphony Under the Stars" />
                </div>

                <div class="row d-flex gap-3 mb-3">
                  <div class="flex-grow-1">
                    <label class="form-label" for="venueId">Venue *</label>
                    <select id="venueId" class="form-select" formControlName="venueId">
                      <option [ngValue]="null" disabled>Select Venue</option>
                      @for (v of venues(); track v.id) {
                        <option [ngValue]="v.id">{{ v.name }} (Cap: {{ v.capacity }})</option>
                      }
                    </select>
                  </div>

                  <div class="flex-grow-1">
                    <label class="form-label" for="categoryId">Category *</label>
                    <select id="categoryId" class="form-select" formControlName="categoryId">
                      <option [ngValue]="null" disabled>Select Category</option>
                      @for (c of categories(); track c.id) {
                        <option [ngValue]="c.id">{{ c.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="row d-flex gap-3 mb-3">
                  <div class="flex-grow-1">
                    <label class="form-label" for="eventDate">Start Date & Time *</label>
                    <input id="eventDate" type="datetime-local" class="form-control" formControlName="eventDate" />
                  </div>

                  <div class="flex-grow-1">
                    <label class="form-label" for="endTime">End Date & Time *</label>
                    <input id="endTime" type="datetime-local" class="form-control" formControlName="endTime" />
                  </div>
                </div>

                <div class="row d-flex gap-3 mb-3">
                  <div class="flex-grow-1">
                    <label class="form-label" for="capacity">Seating Capacity *</label>
                    <input id="capacity" type="number" class="form-control" formControlName="capacity" min="1" />
                  </div>

                  <div class="flex-grow-1">
                    <label class="form-label" for="imageUrl">Image URL</label>
                    <input id="imageUrl" type="url" class="form-control" formControlName="imageUrl" placeholder="https://..." />
                  </div>
                </div>

                <div class="form-group mb-4">
                  <label class="form-label" for="description">Event Description</label>
                  <textarea id="description" class="form-control" formControlName="description" rows="3" placeholder="Tell attendees what to expect..."></textarea>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="showEventModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="eventForm.invalid || saving()">
                    @if (saving()) {
                      <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Saving...
                    } @else {
                      <i class="fa-solid fa-floppy-disk me-1"></i> Save Event
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- DELETE CONFIRMATION MODAL -->
      <app-confirmation-modal
        [isOpen]="showDeleteModal"
        title="Delete Event"
        [message]="'Are you sure you want to delete event ' + (selectedEvent?.title || '') + '? Events with active bookings cannot be deleted.'"
        confirmText="Delete Event"
        [isDanger]="true"
        [isLoading]="deleting()"
        (confirm)="confirmDelete()"
        (cancel)="showDeleteModal = false">
      </app-confirmation-modal>
    </div>
  `,
  styles: [`
    .page-title { font-size: 2rem; font-weight: 800; }
  `]
})
export class EventsManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private venueService = inject(VenueService);
  private categoryService = inject(CategoryService);
  private toastService = inject(ToastService);

  events = signal<EventDto[]>([]);
  venues = signal<Venue[]>([]);
  categories = signal<EventCategory[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  showEventModal = false;
  isEditing = false;
  editingId: number | null = null;
  saving = signal<boolean>(false);

  showDeleteModal = false;
  selectedEvent: EventDto | null = null;
  deleting = signal<boolean>(false);

  eventForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadDropdowns();
    this.loadEvents();
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      venueId: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      eventDate: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      capacity: [100, [Validators.required, Validators.min(1)]],
      imageUrl: ['']
    });
  }

  loadDropdowns(): void {
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
    this.error.set(null);

    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load events.');
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.eventForm.reset({
      capacity: 100,
      venueId: this.venues()[0]?.id || null,
      categoryId: this.categories()[0]?.id || null
    });
    this.showEventModal = true;
  }

  openEditModal(ev: EventDto): void {
    this.isEditing = true;
    this.editingId = ev.id;

    // Find venue and category IDs by name match
    const vMatch = this.venues().find(v => v.name === ev.venueName);
    const cMatch = this.categories().find(c => c.name === ev.categoryName);

    this.eventForm.patchValue({
      title: ev.title,
      description: ev.description,
      venueId: vMatch?.id || null,
      categoryId: cMatch?.id || null,
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().slice(0, 16) : '',
      endTime: ev.endTime ? new Date(ev.endTime).toISOString().slice(0, 16) : '',
      capacity: ev.capacity,
      imageUrl: ev.imageUrl
    });

    this.showEventModal = true;
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formVal = this.eventForm.value;
    const dto: CreateEventDto = {
      title: formVal.title,
      description: formVal.description || '',
      venueId: formVal.venueId,
      categoryId: formVal.categoryId,
      eventDate: new Date(formVal.eventDate).toISOString(),
      endTime: new Date(formVal.endTime).toISOString(),
      capacity: formVal.capacity,
      imageUrl: formVal.imageUrl || ''
    };

    if (this.isEditing && this.editingId) {
      this.eventService.updateEvent(this.editingId, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showEventModal = false;
          this.toastService.success('Event updated successfully.');
          this.loadEvents();
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || 'Failed to update event.');
        }
      });
    } else {
      this.eventService.createEvent(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showEventModal = false;
          this.toastService.success('Event created successfully.');
          this.loadEvents();
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || 'Failed to create event.');
        }
      });
    }
  }

  promptDelete(ev: EventDto): void {
    this.selectedEvent = ev;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedEvent) return;

    this.deleting.set(true);
    this.eventService.deleteEvent(this.selectedEvent.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal = false;
        this.toastService.success('Event deleted successfully.');
        this.loadEvents();
      },
      error: (err) => {
        this.deleting.set(false);
        this.toastService.error(err.error?.message || 'Cannot delete an event with active bookings.');
      }
    });
  }

  closeModalOnBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showEventModal = false;
    }
  }
}
