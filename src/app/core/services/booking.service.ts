import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
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
    const payload = {
      seatIds: dto.seatIds,
      parkingSlotId: dto.parkingSlotId != null ? dto.parkingSlotId : null,
      eventId: dto.eventId
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      map((res: any) => {
        const bId =
          res?.BookingId ??
          res?.bookingId ??
          res?.Id ??
          res?.id ??
          res?.reservationId ??
          res?.ReservationId ??
          res?.booking?.id ??
          res?.booking?.bookingId ??
          0;
        const bNum =
          res?.BookingNumber ??
          res?.bookingNumber ??
          res?.booking?.bookingNumber ??
          '';
        const expires =
          res?.HoldExpiresAt ??
          res?.holdExpiresAt ??
          '';

        return {
          message: res?.Message || res?.message || 'Booking hold created successfully.',
          bookingId: Number(bId),
          bookingNumber: String(bNum),
          holdExpiresAt: String(expires)
        };
      })
    );
  }

  getMyBookings(): Observable<CustomerBookingDto[]> {
    return this.http.get<CustomerBookingDto[]>(`${this.apiUrl}/my-bookings`).pipe(
      catchError(() => of([]))
    );
  }

  getBookingById(id: number | string): Observable<CustomerBookingDto | null> {
    const searchId = id.toString();
    return this.http.get<any>(`${this.apiUrl}/${searchId}`).pipe(
      map((b) => b || null),
      catchError(() => {
        return this.getMyBookings().pipe(
          map((list) => {
            const found = list.find(
              (b) => b.id.toString() === searchId || b.bookingNumber === searchId
            );
            return found || null;
          }),
          catchError(() => of(null))
        );
      })
    );
  }

  getHoldStatus(bookingId: number): Observable<HoldStatusDto> {
    return this.http.get<HoldStatusDto>(`${this.apiUrl}/${bookingId}/hold-status`);
  }

  cancelBooking(bookingId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${bookingId}`);
  }
}

export const ReservationService = BookingService;
export type ReservationService = BookingService;
