import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ParkingService } from '../../../core/services/parking.service';
import { EventService } from '../../../core/services/event.service';
import { ToastService } from '../../../core/services/toast.service';
import { EventDto } from '../../../core/models/event.model';
import { GenerateParkingLayoutDto, ParkingSlotDto, UpdateParkingSlotDto } from '../../../core/models/parking.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-parking-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorBannerComponent],

  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Venue Logistics</span>
          <h1 class="page-title mb-1">Manage Parking Bays</h1>
          <p class="text-muted mb-0">Generate vehicle bays, assign zone classifications, and configure bay fees</p>
        </div>

        <div class="d-flex align-items-center gap-2">
          <label class="form-label mb-0 text-nowrap" for="eventSelect">Select Event:</label>
          <select id="eventSelect" class="form-select" [ngModel]="selectedEventId()" (ngModelChange)="onEventChange($event)" style="min-width: 220px;">
            @for (ev of events(); track ev.id) {
              <option [value]="ev.id">{{ ev.title }}</option>
            }
          </select>
        </div>
      </div>

      <!-- GENERATE PARKING FORM -->
      <div class="card glass-card p-4 mb-5">
        <h3 class="mb-3 d-flex align-items-center gap-2">
          <i class="fa-solid fa-car text-warning"></i>
          Generate Parking Bays For Event
        </h3>
        <p class="text-muted mb-4">
          Add a block of numbered slots assigned to a specific zone (e.g. VIP, General, Area A).
        </p>

        <form [formGroup]="generateForm" (ngSubmit)="generateSlots()" class="row d-flex flex-wrap gap-3 align-items-end">
          <div class="flex-grow-1" style="min-width: 150px;">
            <label class="form-label" for="zone">Zone Name (e.g. VIP, General, A)</label>
            <input id="zone" type="text" class="form-control" formControlName="zone" placeholder="General" />
          </div>

          <div class="flex-grow-1" style="min-width: 140px;">
            <label class="form-label" for="numberOfSlots">Number of Slots (1-50)</label>
            <input id="numberOfSlots" type="number" class="form-control" formControlName="numberOfSlots" min="1" max="100" />
          </div>

          <div class="flex-grow-1" style="min-width: 150px;">
            <label class="form-label" for="defaultFee">Slot Fee (LKR)</label>
            <input id="defaultFee" type="number" class="form-control" formControlName="defaultFee" min="0" />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="generateForm.invalid || generating()" style="height: 44px;">
            @if (generating()) {
              <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Generating Layout...
            } @else {
              <i class="fa-solid fa-square-parking me-1"></i> Generate Parking Layout
            }
          </button>
        </form>
      </div>

      <!-- SLOTS LIST -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Current Parking Bays ({{ slots().length }})</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" (click)="openAddSlotModal()" [disabled]="!selectedEventId()">
            <i class="fa-solid fa-plus me-1"></i> Add Slot
          </button>
          <button class="btn btn-secondary btn-sm" (click)="loadSlots()" [disabled]="loading()">
            <i class="fa-solid fa-rotate-right me-1" [class.fa-spin]="loading()"></i> Refresh Layout
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading parking slots..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadSlots()"></app-error-banner>
      } @else if (slots().length === 0) {
        <div class="card p-5 text-center text-muted">
          <i class="fa-solid fa-square-parking mb-3" style="font-size: 2.5rem;"></i>
          <h4>No Parking Layout Generated</h4>
          <p>Use the form above to allocate parking bays for this event.</p>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive" style="max-height: 520px;">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Slot #</th>
                  <th>Status</th>
                  <th>Fee</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (slot of slots(); track slot.id) {
                  <tr>
                    <td>
                      <span class="badge badge-primary">Zone {{ slot.zone }}</span>
                    </td>
                    <td><strong>Slot #{{ slot.slotNumber }}</strong></td>
                    <td>
                      <span class="badge" [class.badge-success]="slot.status === 'Available'" [class.badge-warning]="slot.status !== 'Available'">
                        {{ slot.status }}
                      </span>
                    </td>
                    <td>
                      @if (editingSlotId === slot.id) {
                        <input type="number" class="form-control form-control-sm" [(ngModel)]="editFee" style="width: 100px;" />
                      } @else {
                        <strong>LKR {{ slot.fee | number }}</strong>
                      }
                    </td>
                    <td class="text-end">
                      @if (editingSlotId === slot.id) {
                        <button class="btn btn-sm btn-success me-1" (click)="saveSlotEdit(slot)" [disabled]="savingSlot()">
                          @if (savingSlot()) {
                            <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Saving...
                          } @else {
                            <i class="fa-solid fa-check me-1"></i> Save
                          }
                        </button>
                        <button class="btn btn-sm btn-outline" (click)="editingSlotId = null" [disabled]="savingSlot()">
                          Cancel
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-secondary me-1" (click)="startEdit(slot)" [disabled]="slot.status !== 'Available'">
                          <i class="fa-solid fa-pen me-1"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="confirmDeleteSlot(slot)" [disabled]="slot.status !== 'Available'">
                          <i class="fa-solid fa-trash me-1"></i> Delete
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ADD SLOT MODAL -->
      @if (showAddSlotModal) {
        <div class="modal-backdrop-custom">
          <div class="modal-card">
            <h3 class="mb-3"><i class="fa-solid fa-plus me-2 text-primary"></i>Add Parking Slot</h3>
            <form [formGroup]="addSlotForm" (ngSubmit)="submitAddSlot()">
              <div class="mb-3">
                <label class="form-label" for="newZone">Zone</label>
                <input id="newZone" type="text" class="form-control" formControlName="zone" placeholder="General, VIP, A" />
              </div>
              <div class="mb-3">
                <label class="form-label" for="newSlotNum">Slot Number</label>
                <input id="newSlotNum" type="number" class="form-control" formControlName="slotNumber" min="1" />
              </div>
              <div class="mb-4">
                <label class="form-label" for="newFee">Slot Fee (LKR)</label>
                <input id="newFee" type="number" class="form-control" formControlName="fee" min="0" />
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" (click)="showAddSlotModal = false" [disabled]="addingSlot()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="addSlotForm.invalid || addingSlot()">
                  @if (addingSlot()) {
                    <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Adding...
                  } @else {
                    <i class="fa-solid fa-plus me-1"></i> Add Slot
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- DELETE CONFIRMATION MODAL -->
      @if (slotToDelete) {
        <div class="modal-backdrop-custom">
          <div class="modal-card">
            <h4 class="mb-3"><i class="fa-solid fa-triangle-exclamation text-danger me-2"></i>Delete Parking Slot?</h4>
            <p>Are you sure you want to delete Slot <strong>#{{ slotToDelete.slotNumber }}</strong> (Zone {{ slotToDelete.zone }})? This action cannot be undone.</p>
            <div class="d-flex justify-content-end gap-2 mt-4">
              <button class="btn btn-secondary" (click)="slotToDelete = null" [disabled]="deletingSlot()">Cancel</button>
              <button class="btn btn-danger" (click)="executeDeleteSlot()" [disabled]="deletingSlot()">
                @if (deletingSlot()) {
                  <i class="fa-solid fa-circle-notch fa-spin me-1"></i> Deleting...
                } @else {
                  <i class="fa-solid fa-trash me-1"></i> Delete Slot
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title { font-size: 2rem; font-weight: 800; }
    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      backdrop-filter: blur(4px);
    }
    .modal-card {
      background: var(--surface, #1e293b);
      border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
      border-radius: var(--radius-lg, 12px);
      padding: 1.75rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
  `]
})
export class ParkingManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parkingService = inject(ParkingService);
  private eventService = inject(EventService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  events = signal<EventDto[]>([]);
  selectedEventId = signal<number>(0);
  slots = signal<ParkingSlotDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  generating = signal<boolean>(false);
  addingSlot = signal<boolean>(false);
  savingSlot = signal<boolean>(false);
  deletingSlot = signal<boolean>(false);

  showAddSlotModal = false;
  slotToDelete: ParkingSlotDto | null = null;
  editingSlotId: number | null = null;
  editFee: number = 0;

  generateForm!: FormGroup;
  addSlotForm!: FormGroup;

  ngOnInit(): void {
    this.generateForm = this.fb.group({
      zone: ['', [Validators.required]],
      numberOfSlots: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      defaultFee: [null, [Validators.required, Validators.min(0)]]
    });

    this.addSlotForm = this.fb.group({
      zone: ['', [Validators.required]],
      slotNumber: [null, [Validators.required, Validators.min(1)]],
      fee: [null, [Validators.required, Validators.min(0)]]
    });

    this.eventService.getEvents().subscribe({
      next: evs => {
        this.events.set(evs || []);
        const paramEventId = this.route.snapshot.queryParams['eventId'];
        if (paramEventId) {
          this.selectedEventId.set(parseInt(paramEventId, 10));
        } else if (evs && evs.length > 0) {
          this.selectedEventId.set(evs[0].id);
        }
        this.loadSlots();
      },
      error: () => {
        this.events.set([]);
        this.loading.set(false);
      }
    });
  }

  onEventChange(newId: any): void {
    this.selectedEventId.set(parseInt(newId, 10));
    this.loadSlots();
  }

  loadSlots(): void {
    const id = this.selectedEventId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);
    this.editingSlotId = null;

    this.parkingService.getSlots(id).subscribe({
      next: (s) => {
        this.slots.set(s || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load parking layout.');
      }
    });
  }

  generateSlots(): void {
    const id = this.selectedEventId();
    if (!id || this.generateForm.invalid) return;

    this.generating.set(true);
    const dto: GenerateParkingLayoutDto = this.generateForm.value;

    this.parkingService.generateLayout(id, dto).subscribe({
      next: (res) => {
        this.generating.set(false);
        this.toastService.success(res?.message || 'Parking layout generated successfully.');
        this.loadSlots();
      },
      error: (err) => {
        this.generating.set(false);
        this.toastService.error(err.error?.message || 'Failed to generate parking layout.');
      }
    });
  }

  openAddSlotModal(): void {
    const currentSlots = this.slots();
    const nextNum = currentSlots.length > 0 ? Math.max(...currentSlots.map(s => s.slotNumber)) + 1 : 1;
    this.addSlotForm.patchValue({
      zone: 'General',
      slotNumber: nextNum,
      fee: 500
    });
    this.showAddSlotModal = true;
  }

  submitAddSlot(): void {
    const id = this.selectedEventId();
    if (!id || this.addSlotForm.invalid) return;

    this.addingSlot.set(true);
    this.parkingService.addSlot(id, this.addSlotForm.value).subscribe({
      next: () => {
        this.addingSlot.set(false);
        this.showAddSlotModal = false;
        this.toastService.success('Parking slot added successfully.');
        this.loadSlots();
      },
      error: (err) => {
        this.addingSlot.set(false);
        this.toastService.error(err.error?.message || 'Failed to add parking slot.');
      }
    });
  }

  startEdit(slot: ParkingSlotDto): void {
    this.editingSlotId = slot.id;
    this.editFee = slot.fee;
  }

  saveSlotEdit(slot: ParkingSlotDto): void {
    this.savingSlot.set(true);
    const dto: UpdateParkingSlotDto = {
      zone: slot.zone,
      slotNumber: slot.slotNumber,
      fee: this.editFee
    };

    this.parkingService.updateSlot(slot.eventId, slot.id, dto).subscribe({
      next: () => {
        this.savingSlot.set(false);
        this.editingSlotId = null;
        this.toastService.success('Slot fee updated.');
        this.loadSlots();
      },
      error: (err) => {
        this.savingSlot.set(false);
        this.toastService.error(err.error?.message || 'Cannot edit reserved slot.');
      }
    });
  }

  confirmDeleteSlot(slot: ParkingSlotDto): void {
    this.slotToDelete = slot;
  }

  executeDeleteSlot(): void {
    const id = this.selectedEventId();
    if (!id || !this.slotToDelete) return;

    this.deletingSlot.set(true);
    this.parkingService.deleteSlot(id, this.slotToDelete.id).subscribe({
      next: () => {
        this.deletingSlot.set(false);
        this.slotToDelete = null;
        this.toastService.success('Slot removed.');
        this.loadSlots();
      },
      error: (err) => {
        this.deletingSlot.set(false);
        this.toastService.error(err.error?.message || 'Cannot delete a reserved parking slot.');
      }
    });
  }
}

