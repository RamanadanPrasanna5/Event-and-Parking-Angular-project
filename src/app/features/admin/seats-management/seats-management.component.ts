import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SeatService } from '../../../core/services/seat.service';
import { EventService } from '../../../core/services/event.service';
import { ToastService } from '../../../core/services/toast.service';
import { EventDto } from '../../../core/models/event.models';
import { GenerateSeatMapDto, SeatDto, UpdateSeatAdminDto } from '../../../core/models/seat.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorBannerComponent } from '../../../shared/components/error-banner/error-banner.component';

@Component({
  selector: 'app-seats-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent, ErrorBannerComponent],

  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <span class="badge badge-primary mb-2">Auditorium Configuration</span>
          <h1 class="page-title mb-1">Manage Seat Maps</h1>
          <p class="text-muted mb-0">Generate seat grids and configure individual ticket pricing</p>
        </div>

        <!-- Event Picker -->
        <div class="d-flex align-items-center gap-2">
          <label class="form-label mb-0 text-nowrap" for="eventSelect">Select Event:</label>
          <select id="eventSelect" class="form-select" [ngModel]="selectedEventId()" (ngModelChange)="onEventChange($event)" style="min-width: 220px;">
            @for (ev of events(); track ev.id) {
              <option [value]="ev.id">{{ ev.title }}</option>
            }
          </select>
        </div>
      </div>

      <!-- GENERATOR CARD -->
      <div class="card glass-card p-4 mb-5">
        <h3 class="mb-3 d-flex align-items-center gap-2">
          <i class="fa-solid fa-wand-magic-sparkles text-warning"></i>
          Generate Automatic Seat Grid
        </h3>
        <p class="text-muted mb-4">
          Quickly generate rows (A, B, C...) with assigned seats per row and standard base ticket price.
        </p>

        <form [formGroup]="generateForm" (ngSubmit)="generateSeats()" class="row d-flex flex-wrap gap-3 align-items-end">
          <div class="flex-grow-1" style="min-width: 140px;">
            <label class="form-label" for="rows">Number of Rows (e.g. 5 = A-E)</label>
            <input id="rows" type="number" class="form-control" formControlName="rows" min="1" max="26" />
          </div>

          <div class="flex-grow-1" style="min-width: 140px;">
            <label class="form-label" for="seatsPerRow">Seats Per Row (1-30)</label>
            <input id="seatsPerRow" type="number" class="form-control" formControlName="seatsPerRow" min="1" max="30" />
          </div>

          <div class="flex-grow-1" style="min-width: 160px;">
            <label class="form-label" for="basePrice">Base Ticket Price (LKR)</label>
            <input id="basePrice" type="number" class="form-control" formControlName="basePrice" min="0" />
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="generateForm.invalid || generating()" style="height: 44px;">
            @if (generating()) {
              <i class="fa-solid fa-spinner fa-spin"></i> Generating...
            } @else {
              <i class="fa-solid fa-grid-2-plus me-1"></i> Generate Grid
            }
          </button>
        </form>
      </div>

      <!-- SEATS LIST / TABLE -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Configured Seats ({{ seats().length }})</h3>
        <button class="btn btn-outline btn-sm" (click)="loadSeats()">
          <i class="fa-solid fa-rotate-right me-1"></i> Refresh Grid
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading seats for event..."></app-loading-spinner>
      } @else if (error()) {
        <app-error-banner [message]="error()!" (retry)="loadSeats()"></app-error-banner>
      } @else if (seats().length === 0) {
        <div class="card p-5 text-center text-dim">
          <i class="fa-solid fa-couch mb-3" style="font-size: 2.5rem;"></i>
          <h4>No Seats Configured Yet</h4>
          <p>Use the generator above to generate rows and seats for this event.</p>
        </div>
      } @else {
        <div class="card p-0 overflow-hidden">
          <div class="table-responsive" style="max-height: 520px;">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Seat #</th>
                  <th>Current Status</th>
                  <th>Ticket Price</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (seat of seats(); track seat.id) {
                  <tr>
                    <td><span class="badge badge-primary">Row {{ seat.row }}</span></td>
                    <td><strong>#{{ seat.seatNumber }}</strong></td>
                    <td>
                      <span class="badge" [class.badge-success]="seat.status === 'Available'" [class.badge-danger]="seat.status !== 'Available'">
                        {{ seat.status }}
                      </span>
                    </td>
                    <td>
                      @if (editingSeatId === seat.id) {
                        <input type="number" class="form-control form-control-sm" [(ngModel)]="editPrice" style="width: 110px;" />
                      } @else {
                        <strong>LKR {{ seat.price | number }}</strong>
                      }
                    </td>
                    <td class="text-end">
                      @if (editingSeatId === seat.id) {
                        <button class="btn btn-sm btn-success me-1" (click)="saveSeatEdit(seat)">
                          <i class="fa-solid fa-check"></i> Save
                        </button>
                        <button class="btn btn-sm btn-outline" (click)="editingSeatId = null">
                          Cancel
                        </button>
                      } @else {
                        <button class="btn btn-sm btn-secondary me-1" (click)="startEdit(seat)">
                          <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="deleteSeat(seat.id)">
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
export class SeatsManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private seatService = inject(SeatService);
  private eventService = inject(EventService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  events = signal<EventDto[]>([]);
  selectedEventId = signal<number>(0);
  seats = signal<SeatDto[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  generating = signal<boolean>(false);

  editingSeatId: number | null = null;
  editPrice: number = 0;

  generateForm!: FormGroup;

  ngOnInit(): void {
    this.generateForm = this.fb.group({
      rows: [5, [Validators.required, Validators.min(1), Validators.max(26)]],
      seatsPerRow: [10, [Validators.required, Validators.min(1), Validators.max(30)]],
      basePrice: [1500, [Validators.required, Validators.min(0)]]
    });

    this.eventService.getEvents().subscribe(evs => {
      this.events.set(evs || []);
      const paramEventId = this.route.snapshot.queryParams['eventId'];
      if (paramEventId) {
        this.selectedEventId.set(parseInt(paramEventId, 10));
      } else if (evs && evs.length > 0) {
        this.selectedEventId.set(evs[0].id);
      }
      this.loadSeats();
    });
  }

  onEventChange(newId: any): void {
    this.selectedEventId.set(parseInt(newId, 10));
    this.loadSeats();
  }

  loadSeats(): void {
    const id = this.selectedEventId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);
    this.editingSeatId = null;

    this.seatService.getSeats(id).subscribe({
      next: (s) => {
        this.seats.set(s || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load seats for the selected event.');
      }
    });
  }

  generateSeats(): void {
    const id = this.selectedEventId();
    if (!id || this.generateForm.invalid) return;

    this.generating.set(true);
    const dto: GenerateSeatMapDto = this.generateForm.value;

    this.seatService.generateSeats(id, dto).subscribe({
      next: (res) => {
        this.generating.set(false);
        this.toastService.success(res.message || 'Seat map generated successfully!');
        this.loadSeats();
      },
      error: (err) => {
        this.generating.set(false);
        this.toastService.error(err.error?.message || 'Failed to generate seat map.');
      }
    });
  }

  startEdit(seat: SeatDto): void {
    this.editingSeatId = seat.id;
    this.editPrice = seat.price;
  }

  saveSeatEdit(seat: SeatDto): void {
    const id = this.selectedEventId();
    if (!id) return;

    const dto: UpdateSeatAdminDto = {
      row: seat.row,
      seatNumber: seat.seatNumber,
      price: this.editPrice
    };

    this.seatService.updateSeat(id, seat.id, dto).subscribe({
      next: () => {
        this.editingSeatId = null;
        this.toastService.success('Seat price updated.');
        this.loadSeats();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update seat.');
      }
    });
  }

  deleteSeat(seatId: number): void {
    const id = this.selectedEventId();
    if (!id) return;

    this.seatService.deleteSeat(id, seatId).subscribe({
      next: () => {
        this.toastService.success('Seat deleted.');
        this.loadSeats();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Cannot delete a reserved seat.');
      }
    });
  }
}
