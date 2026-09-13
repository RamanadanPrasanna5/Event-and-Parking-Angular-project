import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BookingCreatedResponse,
  CreateUnifiedBookingDto,
  CustomerBookingDto,
  HoldStatusDto
} from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/bookings`;

  createBooking(dto: CreateUnifiedBookingDto): Observable<BookingCreatedResponse> {
    return this.http.post<BookingCreatedResponse>(this.apiUrl, dto);
  }

  getMyBookings(): Observable<CustomerBookingDto[]> {
    return this.http.get<CustomerBookingDto[]>(`${this.apiUrl}/my-bookings`);
  }

  getHoldStatus(bookingId: number): Observable<HoldStatusDto> {
    return this.http.get<HoldStatusDto>(`${this.apiUrl}/${bookingId}/hold-status`);
  }

  cancelBooking(bookingId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${bookingId}`);
  }
}

// Alias for backward compatibility with existing code
export const ReservationService = BookingService;
export type ReservationService = BookingService;
