import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VenueService } from '../../../core/services/venue.service';
import { ToastService } from '../../../core/services/toast.service';
import { CreateVenueDto, Venue } from '../../../core/models/venue.models';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-venues-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmationModalComponent, LoadingSpinnerComponent, ErrorBannerComponent],
  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Master Data</span>
          <h1 class="page-title mb-1">Venues Management</h1>
          <p class="text-muted mb-0">Maintain physical auditoriums, arenas, and halls</p>
        </div>

        <button class="btn btn-primary" (click)="openCreateModal()">
          <i class="fa-solid fa-plus me-1"></i> Add Venue
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading venues..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadVenues()"></app-error-banner>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Venue Name</th>
                  <th>Location / Address</th>
                  <th>Max Capacity</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (v of venues(); track v.id) {
                  <tr>
                    <td><strong class="text-white">{{ v.name }}</strong></td>
                    <td>{{ v.location }}</td>
                    <td><strong>{{ v.capacity | number }}</strong> seats</td>
                    <td>
                      <span class="badge" [class.badge-success]="v.isActive" [class.badge-danger]="!v.isActive">
                        {{ v.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <div class="d-flex justify-content-end gap-1">
                        <button class="btn btn-sm btn-secondary" (click)="openEditModal(v)" title="Edit">
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="promptDelete(v)" title="Delete">
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

      <!-- MODAL -->
      @if (showModal) {
        <div class="modal-overlay" (click)="closeOnBackdrop($event)">
          <div class="modal-container">
            <div class="modal-header">
              <h4>{{ isEditing ? 'Edit Venue' : 'Create New Venue' }}</h4>
              <button class="btn btn-icon btn-outline" (click)="showModal = false">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="modal-body">
              <form [formGroup]="venueForm" (ngSubmit)="saveVenue()">
                <div class="form-group mb-3">
                  <label class="form-label" for="vName">Venue Name *</label>
                  <input id="vName" type="text" class="form-control" formControlName="name" placeholder="e.g. Grand Arena Hall" />
                </div>
                <div class="form-group mb-3">
                  <label class="form-label" for="vLocation">Location / Address *</label>
                  <input id="vLocation" type="text" class="form-control" formControlName="location" placeholder="e.g. 100 Lotus Rd, Colombo" />
                </div>
                <div class="form-group mb-4">
                  <label class="form-label" for="vCapacity">Total Capacity *</label>
                  <input id="vCapacity" type="number" class="form-control" formControlName="capacity" min="1" />
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="venueForm.invalid || saving()">
                    {{ isEditing ? 'Update Venue' : 'Create Venue' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <app-confirmation-modal
        [isOpen]="showDeleteModal"
        title="Delete Venue"
        [message]="'Are you sure you want to delete venue ' + (selectedVenue?.name || '') + '? A venue cannot be deleted while upcoming events are scheduled.'"
        confirmText="Delete Venue"
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
export class VenuesManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private venueService = inject(VenueService);
  private toastService = inject(ToastService);

  venues = signal<Venue[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  saving = signal<boolean>(false);

  showDeleteModal = false;
  selectedVenue: Venue | null = null;
  deleting = signal<boolean>(false);

  venueForm!: FormGroup;

  ngOnInit(): void {
    this.venueForm = this.fb.group({
      name: ['', [Validators.required]],
      location: ['', [Validators.required]],
      capacity: [500, [Validators.required, Validators.min(1)]]
    });
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading.set(true);
    this.venueService.getVenues().subscribe({
      next: (v) => { this.venues.set(v || []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('Failed to load venues.'); }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.venueForm.reset({ capacity: 500 });
    this.showModal = true;
  }

  openEditModal(v: Venue): void {
    this.isEditing = true;
    this.editingId = v.id;
    this.venueForm.patchValue({
      name: v.name,
      location: v.location,
      capacity: v.capacity
    });
    this.showModal = true;
  }

  saveVenue(): void {
    if (this.venueForm.invalid) return;
    this.saving.set(true);
    const dto: CreateVenueDto = this.venueForm.value;

    if (this.isEditing && this.editingId) {
      this.venueService.updateVenue(this.editingId, dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal = false;
          this.toastService.success('Venue updated successfully.');
          this.loadVenues();
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || 'Failed to update venue.');
        }
      });
    } else {
      this.venueService.createVenue(dto).subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal = false;
          this.toastService.success('Venue created successfully.');
          this.loadVenues();
        },
        error: (err) => {
          this.saving.set(false);
          this.toastService.error(err.error?.message || 'Failed to create venue.');
        }
      });
    }
  }

  promptDelete(v: Venue): void {
    this.selectedVenue = v;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedVenue) return;
    this.deleting.set(true);
    this.venueService.deleteVenue(this.selectedVenue.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal = false;
        this.toastService.success('Venue deleted.');
        this.loadVenues();
      },
      error: (err) => {
        this.deleting.set(false);
        this.toastService.error(err.error?.message || 'Cannot delete venue with scheduled events.');
      }
    });
  }

  closeOnBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal = false;
  }
}
