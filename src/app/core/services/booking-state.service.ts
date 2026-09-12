import { Injectable, computed, signal } from '@angular/core';
import { EventDto } from '../models/event.model';
import { SeatDto } from '../models/seat.model';
import { ParkingSlotDto } from '../models/parking.model';

export interface ActiveHold {
  bookingId: number;
  bookingNumber: string;
  holdExpiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  private currentEventSignal = signal<EventDto | null>(null);
  private selectedSeatsSignal = signal<SeatDto[]>([]);
  private selectedParkingSignal = signal<ParkingSlotDto | null>(null);
  private activeHoldSignal = signal<ActiveHold | null>(null);

  public readonly currentEvent = this.currentEventSignal.asReadonly();
  public readonly selectedSeats = this.selectedSeatsSignal.asReadonly();
  public readonly selectedParking = this.selectedParkingSignal.asReadonly();
  public readonly activeHold = this.activeHoldSignal.asReadonly();

  public readonly seatsCount = computed(() => this.selectedSeatsSignal().length);
  public readonly seatsTotal = computed(() =>
    this.selectedSeatsSignal().reduce((acc, s) => acc + (s.price || 0), 0)
  );
  public readonly parkingFee = computed(() =>

    this.selectedParkingSignal()?.fee || 0
  );
  public readonly grandTotal = computed(() =>
    this.seatsTotal() + this.parkingFee()
  );
  public readonly hasSelection = computed(() =>
    this.selectedSeatsSignal().length > 0
  );

  setEvent(event: EventDto): void {
    const prevEvent = this.currentEventSignal();
    if (!prevEvent || prevEvent.id !== event.id) {
      this.currentEventSignal.set(event);
      this.selectedSeatsSignal.set([]);
      this.selectedParkingSignal.set(null);
      this.activeHoldSignal.set(null);
    }
  }

  toggleSeat(seat: SeatDto): boolean {
    const current = this.selectedSeatsSignal();
    const exists = current.some(s => s.id === seat.id);

    if (exists) {
      this.selectedSeatsSignal.set(current.filter(s => s.id !== seat.id));
      return false;
    } else {
      this.selectedSeatsSignal.set([...current, seat]);
      return true;
    }
  }

  isSeatSelected(seatId: number): boolean {
    return this.selectedSeatsSignal().some(s => s.id === seatId);
  }

  removeSeat(seatId: number): void {
    this.selectedSeatsSignal.update(seats => seats.filter(s => s.id !== seatId));
  }

  selectParkingSlot(slot: ParkingSlotDto): void {
    const current = this.selectedParkingSignal();
    if (current && current.id === slot.id) {
      this.selectedParkingSignal.set(null);
    } else {
      this.selectedParkingSignal.set(slot);
    }
  }

  setParkingSlot(slot: ParkingSlotDto | null): void {
    this.selectedParkingSignal.set(slot);
  }

  clearParkingSlot(): void {
    this.selectedParkingSignal.set(null);
  }

  setActiveHold(hold: ActiveHold | null): void {
    this.activeHoldSignal.set(hold);
  }

  clearAll(): void {
    this.currentEventSignal.set(null);
    this.selectedSeatsSignal.set([]);
    this.selectedParkingSignal.set(null);
    this.activeHoldSignal.set(null);
  }
}
