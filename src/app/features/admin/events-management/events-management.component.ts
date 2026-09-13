import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { VenueService } from '../../../core/services/venue.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateEventDto, EventDto } from '../../../core/models/event.models';
import { Venue } from '../../../core/models/venue.models';
import { EventCategory } from '../../../core/models/category.models';
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
          <i class="fa-solid fa-plus me-1"></i> Add New Event
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
                      <div class="font-bold text-white">{{ ev.title }}</div>
                      <small class="text-dim">ID: #{{ ev.id }}</small>
                    </td>
                    <td>
                      <span class="badge badge-primary">{{ ev.categoryName || 'General' }}</span>
                    </td>
                    <td>{{ ev.venueName }}</td>
                    <td>
                      <div>{{ ev.eventDate | date:'mediumDate' }}</div>
                      <small class="text-dim">{{ ev.eventDate | date:'shortTime' }}</small>
                    </td>
                    <td><strong>{{ ev.capacity }}</strong> seats</td>
                    <td>
                      <span class="badge badge-success">{{ ev.status || 'Active' }}</span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1">
                        <a [routerLink]="['/admin/seats']" [queryParams]="{ eventId: ev.id }" class="btn btn-sm btn-outline" title="Configure Seats">
                          <i class="fa-solid fa-couch"></i>
                        </a>
                        <a [routerLink]="['/admin/parking']" [queryParams]="{ eventId: ev.id }" class="btn btn-sm btn-outline" title="Configure Parking">
                          <i class="fa-solid fa-square-parking"></i>
                        </a>
                        <button class="btn btn-sm btn-secondary" (click)="openEditModal(ev)" title="Edit Event Details">
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="promptDelete(ev)" title="Delete Event">
                          <i class="fa-solid fa-trash"></i>
                        </button>
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
              <button class="btn btn-icon btn-outline" (click)="showEventModal = false">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="modal-body">
              @if (modalError()) {
                <div class="alert alert-danger mb-3">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  <span>{{ modalError() }}</span>
                </div>
              }

              <form [formGroup]="eventForm" (ngSubmit)="saveEvent()">
                <div class="form-group mb-3">
                  <label class="form-label" for="title">Event Title *</label>
                  <input id="title" type="text" class="form-control" formControlName="title" placeholder="e.g. Symphony Under the Stars" />
                </div>

                <div class="row d-flex gap-3 mb-3">
                  <div class="flex-grow-1">
                    <label class="form-label" for="venueId">Venue *</label>
                    <select id="venueId" class="form-select" formControlName="venueId" (change)="onVenueSelectChange($event)">
                      <option [ngValue]="null" disabled>Select Venue</option>
                      @for (v of venues(); track v.id) {
                        <option [ngValue]="v.id">{{ v.name }} (Max: {{ v.capacity }} seats)</option>
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
                    <div class="input-with-calendar">
                      <input
                        #startInput
                        id="eventDate"
                        type="datetime-local"
                        class="form-control"
                        formControlName="eventDate"
                        [min]="minDateTime()"
                        (click)="openPicker(startInput)"
                        (change)="onStartDateChange()" />
                      <button
                        type="button"
                        class="calendar-trigger-btn"
                        (click)="openPicker(startInput)"
                        title="Open Calendar">
                        <i class="fa-solid fa-calendar-days"></i>
                      </button>
                    </div>
                  </div>

                  <div class="flex-grow-1">
                    <label class="form-label" for="endTime">End Date & Time *</label>
                    <div class="input-with-calendar">
                      <input
                        #endInput
                        id="endTime"
                        type="datetime-local"
                        class="form-control"
                        formControlName="endTime"
                        [min]="eventForm.get('eventDate')?.value || minDateTime()"
                        (click)="openPicker(endInput)" />
                      <button
                        type="button"
                        class="calendar-trigger-btn"
                        (click)="openPicker(endInput)"
                        title="Open Calendar">
                        <i class="fa-solid fa-calendar-days"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="row d-flex gap-3 mb-3">
                  <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <label class="form-label mb-0" for="capacity">Seating Capacity *</label>
                      <small class="badge badge-primary">Venue Limit: {{ selectedVenueCapacity() }}</small>
                    </div>
                    <input
                      id="capacity"
                      type="number"
                      class="form-control"
                      formControlName="capacity"
                      min="1"
                      [max]="selectedVenueCapacity()" />
                    <small class="text-dim">Must not exceed selected venue limit ({{ selectedVenueCapacity() }} seats).</small>
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
                      <i class="fa-solid fa-spinner fa-spin"></i> Saving...
                    } @else {
                      {{ isEditing ? 'Update Event' : 'Create Event' }}
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
  modalError = signal<string | null>(null);
  selectedVenueCapacity = signal<number>(60);
  minDateTime = signal<string>('');

  showDeleteModal = false;
  selectedEvent: EventDto | null = null;
  deleting = signal<boolean>(false);

  eventForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadDropdowns();
    this.loadEvents();
  }

  private toLocalIsoString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private getDefaultStartIso(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return this.toLocalIsoString(d);
  }

  private getDefaultEndIso(startDateStr?: string): string {
    const base = startDateStr ? new Date(startDateStr) : new Date();
    if (!startDateStr) {
      base.setDate(base.getDate() + 1);
      base.setHours(14, 0, 0, 0);
    } else {
      base.setHours(base.getHours() + 4);
    }
    return this.toLocalIsoString(base);
  }

  openPicker(inputEl: HTMLInputElement): void {
    try {
      if (typeof inputEl.showPicker === 'function') {
        inputEl.showPicker();
      } else {
        inputEl.focus();
      }
    } catch {
      inputEl.focus();
    }
  }

  onVenueSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const vId = Number(select.value);
    const v = this.venues().find(x => x.id === vId);
    if (v) {
      this.selectedVenueCapacity.set(v.capacity);
      const cap = Number(this.eventForm.get('capacity')?.value);
      if (!cap || cap > v.capacity) {
        this.eventForm.patchValue({ capacity: Math.min(50, v.capacity) });
      }
    }
  }

  onStartDateChange(): void {
    const startVal = this.eventForm.get('eventDate')?.value;
    if (!startVal) return;
    const endVal = this.eventForm.get('endTime')?.value;
    if (!endVal || new Date(endVal) <= new Date(startVal)) {
      this.eventForm.patchValue({ endTime: this.getDefaultEndIso(startVal) });
    }
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      venueId: [null, [Validators.required]],
      categoryId: [null, [Validators.required]],
      eventDate: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      capacity: [50, [Validators.required, Validators.min(1)]],
      imageUrl: ['']
    });
  }

  loadDropdowns(): void {
    this.venueService.getVenues().subscribe(v => {
      this.venues.set(v || []);
      if (v && v.length > 0 && !this.isEditing) {
        this.selectedVenueCapacity.set(v[0].capacity);
      }
    });
    this.categoryService.getCategories().subscribe(c => this.categories.set(c || []));
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
    this.modalError.set(null);
    this.minDateTime.set(this.toLocalIsoString(new Date()));

    const defaultVenue = this.venues()[0];
    const defaultCat = this.categories()[0];
    const cap = defaultVenue ? defaultVenue.capacity : 60;
    this.selectedVenueCapacity.set(cap);

    const startStr = this.getDefaultStartIso();
    const endStr = this.getDefaultEndIso(startStr);

    this.eventForm.reset({
      title: '',
      description: '',
      venueId: defaultVenue?.id ?? null,
      categoryId: defaultCat?.id ?? null,
      eventDate: startStr,
      endTime: endStr,
      capacity: Math.min(50, cap),
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200'
    });
    this.showEventModal = true;
  }

  openEditModal(ev: EventDto): void {
    this.isEditing = true;
    this.editingId = ev.id;
    this.modalError.set(null);
    this.minDateTime.set(this.toLocalIsoString(new Date()));

    // Find venue and category IDs by name match
    const vMatch = this.venues().find(v => v.name === ev.venueName);
    const cMatch = this.categories().find(c => c.name === ev.categoryName);

    if (vMatch) {
      this.selectedVenueCapacity.set(vMatch.capacity);
    }

    const startIso = ev.eventDate ? this.toLocalIsoString(new Date(ev.eventDate)) : '';
    const endIso = ev.endTime ? this.toLocalIsoString(new Date(ev.endTime)) : '';

    this.eventForm.patchValue({
      title: ev.title,
      description: ev.description,
      venueId: vMatch?.id || null,
      categoryId: cMatch?.id || null,
      eventDate: startIso,
      endTime: endIso,
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

    this.modalError.set(null);
    const formVal = this.eventForm.value;
    const venueId = Number(formVal.venueId);
    const categoryId = Number(formVal.categoryId);
    const capacity = Number(formVal.capacity);

    const venue = this.venues().find(v => v.id === venueId);
    if (venue && capacity > venue.capacity) {
      this.modalError.set(`Event capacity (${capacity}) cannot exceed venue capacity (${venue.capacity} seats).`);
      return;
    }

    const startDate = new Date(formVal.eventDate);
    const endDate = new Date(formVal.endTime);
    if (endDate <= startDate) {
      this.modalError.set('End Date & Time must be after the Start Date & Time.');
      return;
    }

    this.saving.set(true);
    const dto: CreateEventDto = {
      title: formVal.title ? formVal.title.trim() : '',
      description: formVal.description ? formVal.description.trim() : '',
      venueId: venueId,
      categoryId: categoryId,
      eventDate: startDate.toISOString(),
      endTime: endDate.toISOString(),
      capacity: capacity,
      imageUrl: formVal.imageUrl ? formVal.imageUrl.trim() : ''
    };

    if (this.isEditing && this.editingId) {
      this.eventService.updateEvent(this.editingId, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showEventModal = false;
          this.toastService.success('Event updated successfully!');
          this.loadEvents();
        },
        error: (err) => {
          this.saving.set(false);
          const errMsg = err.error?.message || err.error?.Message || (typeof err.error === 'string' ? err.error : null) || 'Failed to update event.';
          this.modalError.set(errMsg);
          this.toastService.error(errMsg);
        }
      });
    } else {
      this.eventService.createEvent(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showEventModal = false;
          this.toastService.success('Event created successfully!');
          this.loadEvents();
        },
        error: (err) => {
          this.saving.set(false);
          const errMsg = err.error?.message || err.error?.Message || (typeof err.error === 'string' ? err.error : null) || 'Failed to create event.';
          this.modalError.set(errMsg);
          this.toastService.error(errMsg);
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

