import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ParkingService } from '../../../core/services/parking.service';
import { EventService } from '../../../core/services/event.service';
import { ToastService } from '../../../core/services/toast.service';
import { EventDto } from '../../../core/models/event.models';
import { GenerateParkingLayoutDto, ParkingSlotDto, UpdateParkingSlotDto } from '../../../core/models/parking.models';
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
              <i class="fa-solid fa-spinner fa-spin"></i> Adding Bays...
            } @else {
              <i class="fa-solid fa-plus me-1"></i> Add Parking Block
            }
          </button>
        </form>
      </div>

      <!-- SLOTS LIST -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Current Parking Bays ({{ slots().length }})</h3>
        <button class="btn btn-outline btn-sm" (click)="loadSlots()">
          <i class="fa-solid fa-rotate-right me-1"></i> Refresh Layout
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading parking slots..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadSlots()"></app-error-banner>
      } @else if (slots().length === 0) {
        <div class="card p-5 text-center text-dim">
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
                        <button class="btn btn-sm btn-success me-1" (click)="saveSlotEdit(slot)">
                          <i class="fa-solid fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" (click)="editingSlotId = null">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-secondary me-1" (click)="startEdit(slot)" [disabled]="slot.status !== 'Available'">
                          <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="deleteSlot(slot.id)" [disabled]="slot.status !== 'Available'">
                          <i class="fa-solid fa-trash"></i>
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
    </div>
  `,
  styles: [`
    .page-title { font-size: 2rem; font-weight: 800; }
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

  editingSlotId: number | null = null;
  editFee: number = 0;

  generateForm!: FormGroup;

  ngOnInit(): void {
    this.generateForm = this.fb.group({
      zone: ['General', [Validators.required]],
      numberOfSlots: [20, [Validators.required, Validators.min(1), Validators.max(100)]],
      defaultFee: [500, [Validators.required, Validators.min(0)]]
    });

    this.eventService.getEvents().subscribe(evs => {
      this.events.set(evs || []);
      const paramEventId = this.route.snapshot.queryParams['eventId'];
      if (paramEventId) {
        this.selectedEventId.set(parseInt(paramEventId, 10));
      } else if (evs && evs.length > 0) {
        this.selectedEventId.set(evs[0].id);
      }
      this.loadSlots();
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
        this.toastService.success(res.message || 'Parking bays generated successfully!');
        this.loadSlots();
      },
      error: (err) => {
        this.generating.set(false);
        this.toastService.error(err.error?.message || 'Failed to generate parking layout.');
      }
    });
  }

  startEdit(slot: ParkingSlotDto): void {
    this.editingSlotId = slot.id;
    this.editFee = slot.fee;
  }

  saveSlotEdit(slot: ParkingSlotDto): void {
    const dto: UpdateParkingSlotDto = {
      zone: slot.zone,
      slotNumber: slot.slotNumber,
      fee: this.editFee
    };

    this.parkingService.updateSlot(slot.eventId, slot.id, dto).subscribe({
      next: () => {
        this.editingSlotId = null;
        this.toastService.success('Slot fee updated.');
        this.loadSlots();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Cannot edit reserved slot.');
      }
    });
  }

  deleteSlot(slotId: number): void {
    const id = this.selectedEventId();
    if (!id) return;

    this.parkingService.deleteSlot(id, slotId).subscribe({
      next: () => {
        this.toastService.success('Slot removed.');
        this.loadSlots();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Cannot delete a reserved parking slot.');
      }
    });
  }
}
