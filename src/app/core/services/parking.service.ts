import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GenerateParkingLayoutDto,
  ParkingSlotDto,
  ReserveParkingDto,
  UpdateParkingSlotDto
} from '../models/parking.models';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  getSlots(eventId: number): Observable<ParkingSlotDto[]> {
    return this.http.get<ParkingSlotDto[]>(`${this.apiUrl}/events/${eventId}/parking-slots`);
  }

  generateLayout(eventId: number, dto: GenerateParkingLayoutDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/events/${eventId}/parking-slots`, dto);
  }

  updateSlot(eventId: number, slotId: number, dto: UpdateParkingSlotDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/events/${eventId}/parking-slots/${slotId}`, dto);
  }

  deleteSlot(eventId: number, slotId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventId}/parking-slots/${slotId}`);
  }

  reserveParking(bookingId: number, slotId: number): Observable<{ message: string }> {
    const body: ReserveParkingDto = { parkingSlotId: slotId };
    return this.http.post<{ message: string }>(`${this.apiUrl}/bookings/${bookingId}/parking`, body);
  }

  removeParking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bookings/${bookingId}/parking`);
  }
}
